"""One reusable, isolated model process. No candidate image/result cache."""
import asyncio
import contextlib
import json
import struct
import sys
import time


class HandwritingProcess:
    def __init__(self, command=None, idle_seconds=300, timeout=60):
        self.command = command or (sys.executable, '-m', 'app.services.handwriting_worker', '--serve')
        self.idle_seconds, self.timeout = idle_seconds, timeout
        self.process = None
        self._lock = asyncio.Lock()
        self._idle_timer = None
        self._last_used = 0

    def _cancel_idle(self):
        if self._idle_timer:
            self._idle_timer.cancel()
            self._idle_timer = None

    async def _dispose(self):
        process, self.process = self.process, None
        if process is not None:
            if process.returncode is None:
                with contextlib.suppress(ProcessLookupError):
                    process.kill()
            await process.wait()
            if process.stdin:
                process.stdin.close()

    async def close(self):
        async with self._lock:
            self._cancel_idle()
            await self._dispose()

    async def _close_if_idle(self):
        async with self._lock:
            if time.monotonic() - self._last_used >= self.idle_seconds:
                await self._dispose()

    async def _exchange(self, data):
        if self.process is None or self.process.returncode is not None:
            await self._dispose()
            self.process = await asyncio.create_subprocess_exec(
                *self.command, stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL,
                limit=2048)
        process = self.process
        process.stdin.write(struct.pack('!I', len(data)))
        process.stdin.write(data)
        await process.stdin.drain()
        output = await process.stdout.readline()
        if not output or len(output) > 2048:
            raise ValueError('Invalid reader response')
        name = json.loads(output)['name']
        if not isinstance(name, str) or len(name) > 100:
            raise ValueError('Invalid reader response')
        return name

    async def recognize(self, data):
        if not 0 < len(data) <= 262144:
            raise ValueError('Invalid crop size')
        async with self._lock:
            self._cancel_idle()
            try:
                name = await asyncio.wait_for(self._exchange(data), timeout=self.timeout)
            except BaseException:
                # Cancellation/timeouts must reap the worker, not leave inference running.
                await self._dispose()
                raise
            self._last_used = time.monotonic()
            self._idle_timer = asyncio.get_running_loop().call_later(
                self.idle_seconds, lambda: asyncio.create_task(self._close_if_idle()))
            return name


reader = HandwritingProcess()
