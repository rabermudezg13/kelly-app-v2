import asyncio
import io
import json
import struct
import sys
import pytest
from app.services.handwriting_process import HandwritingProcess
from app.services.handwriting_worker import read_frame, serve


def test_frames_are_bounded_and_truncation_does_not_reuse_previous_input():
    assert read_frame(io.BytesIO()) is None
    assert read_frame(io.BytesIO(struct.pack('!I',3)+b'abc'))==b'abc'
    for data in [b'x',struct.pack('!I',0),struct.pack('!I',262145),struct.pack('!I',10)+b'abc']:
        with pytest.raises(ValueError):read_frame(io.BytesIO(data))


def test_worker_serves_each_crop_without_retaining_response(monkeypatch):
    from app.services import handwriting_worker as worker
    calls=[]
    def recognize(raw,reader):
        calls.append(raw)
        return 'Alex Example' if raw==b'A' else 'Jordan Example'
    monkeypatch.setattr(worker,'recognize_crop',recognize)
    source=io.BytesIO(struct.pack('!I',1)+b'A'+struct.pack('!I',1)+b'B')
    target=io.StringIO();serve(object(),source,target)
    assert calls==[b'A',b'B']
    assert [json.loads(line)['name'] for line in target.getvalue().splitlines()]==['Alex Example','Jordan Example']


@pytest.fixture
def command(tmp_path):
    path=tmp_path/'reader.py'
    path.write_text('''import sys,struct,json,time
while True:
 prefix=sys.stdin.buffer.read(4)
 if not prefix:break
 data=sys.stdin.buffer.read(struct.unpack('!I',prefix)[0])
 if data==b'H':time.sleep(10)
 if data==b'X':print('invalid',flush=True);continue
 if data==b'L':print('x'*3000,flush=True);continue
 if data==b'D':sys.exit(1)
 print(json.dumps({'name':'Alex Example' if data==b'A' else 'Jordan Example'}),flush=True)
 data=None
''')
    return (sys.executable,'-u',str(path))


def test_reader_reuses_process_but_never_reuses_candidate_result(command):
    async def scenario():
        pool=HandwritingProcess(command,idle_seconds=1)
        try:
            assert await pool.recognize(b'A')=='Alex Example'
            first=pool.process
            assert await pool.recognize(b'B')=='Jordan Example'
            assert pool.process is first
        finally:await pool.close()
        assert first.returncode is not None and pool.process is None
    asyncio.run(scenario())


def test_idle_releases_worker_and_next_read_starts_a_new_one(command):
    async def scenario():
        pool=HandwritingProcess(command,idle_seconds=.04)
        try:
            await pool.recognize(b'A');first=pool.process
            await asyncio.sleep(.15)
            assert pool.process is None and first.returncode is not None
            await pool.recognize(b'B')
            assert pool.process is not first
        finally:await pool.close()
    asyncio.run(scenario())


@pytest.mark.parametrize('data',[b'X',b'L',b'D'])
def test_bad_or_crashed_worker_is_reaped_and_reader_recovers(command,data):
    async def scenario():
        pool=HandwritingProcess(command)
        try:
            with pytest.raises((ValueError,KeyError)):await pool.recognize(data)
            assert pool.process is None
            assert await pool.recognize(b'A')=='Alex Example'
        finally:await pool.close()
    asyncio.run(scenario())


def test_timeout_and_cancellation_reap_worker_and_allow_next_read(command):
    async def scenario():
        pool=HandwritingProcess(command,timeout=.2)
        try:
            with pytest.raises(asyncio.TimeoutError):await pool.recognize(b'H')
            assert pool.process is None
            pool.timeout=2
            task=asyncio.create_task(pool.recognize(b'H'))
            while pool.process is None:await asyncio.sleep(.005)
            process=pool.process;task.cancel()
            with pytest.raises(asyncio.CancelledError):await task
            assert process.returncode is not None and pool.process is None
            assert await pool.recognize(b'A')=='Alex Example'
        finally:await pool.close()
    asyncio.run(scenario())
