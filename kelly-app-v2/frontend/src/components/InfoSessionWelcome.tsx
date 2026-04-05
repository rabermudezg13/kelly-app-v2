import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeStep, completeInfoSession, getInfoSession, updateInterviewQuestions } from '../services/api'
import type { InfoSessionWithSteps } from '../types'

interface Props {
  sessionData: InfoSessionWithSteps
  onSessionCompleted?: () => void
}

function InfoSessionWelcome({ sessionData, onSessionCompleted }: Props) {
  const navigate = useNavigate()
  const [steps, setSteps] = useState(sessionData.steps)
  const [allStepsCompleted, setAllStepsCompleted] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentSessionData, setCurrentSessionData] = useState(sessionData)
  const [showQuestions, setShowQuestions] = useState(false)
  const [questionsSubmitted, setQuestionsSubmitted] = useState(false)
  const isParaprofessional = sessionData.session_type === 'paraprofessional'
  const [questions, setQuestions] = useState({
    q1: sessionData.question_1_response || '',
    q2: sessionData.question_2_response || '',
    q3: sessionData.question_3_response || '',
    q4: sessionData.question_4_response || '',
    q5: sessionData.question_5_response || '',
    q6: sessionData.question_6_response || '',
    q7: sessionData.question_7_response || '',
    q8: sessionData.question_8_response || '',
  })

  // Load questions responses from sessionData only on first mount
  useEffect(() => {
    if (sessionData) {
      setQuestions({
        q1: sessionData.question_1_response || '',
        q2: sessionData.question_2_response || '',
        q3: sessionData.question_3_response || '',
        q4: sessionData.question_4_response || '',
        q5: sessionData.question_5_response || '',
        q6: sessionData.question_6_response || '',
        q7: sessionData.question_7_response || '',
        q8: sessionData.question_8_response || '',
      })
      // Show questions if responses already exist
      if (sessionData.question_1_response || sessionData.question_2_response ||
          sessionData.question_3_response || sessionData.question_4_response ||
          sessionData.question_5_response || sessionData.question_6_response ||
          sessionData.question_7_response || sessionData.question_8_response) {
        setShowQuestions(true)
        setQuestionsSubmitted(true)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with backend periodically to get latest state
  useEffect(() => {
    const syncSession = async () => {
      try {
        const latest = await getInfoSession(sessionData.id)
        setCurrentSessionData(latest)
        
        // Only update steps if backend has changes (don't overwrite optimistic local updates)
        // Compare current steps with latest steps to see if there are real changes
        const currentStepMap = new Map(steps.map(s => [s.step_name, s.is_completed]))
        const latestStepMap = new Map(latest.steps.map(s => [s.step_name, s.is_completed]))
        
        // Check if any step status changed on the backend
        let hasChanges = false
        for (const [stepName, isCompleted] of latestStepMap) {
          if (currentStepMap.get(stepName) !== isCompleted) {
            hasChanges = true
            break
          }
        }
        
        // Only update if backend has changes we don't have locally
        if (hasChanges) {
          console.log('🔄 Backend has step changes, updating steps')
          setSteps(latest.steps)
        }

        // Show questions if session is initiated (completed info session) OR if there are responses
        const shouldShowQuestions = latest.status === 'initiated' ||
                                   latest.question_1_response || latest.question_2_response ||
                                   latest.question_3_response || latest.question_4_response ||
                                   latest.question_5_response || latest.question_6_response ||
                                   latest.question_7_response || latest.question_8_response

        if (shouldShowQuestions) {
          // Only update questions from backend if the user is NOT actively editing them
          // (i.e., questionsSubmitted is true = they are in view mode, not edit mode)
          if (questionsSubmitted) {
            setQuestions({
              q1: latest.question_1_response || '',
              q2: latest.question_2_response || '',
              q3: latest.question_3_response || '',
              q4: latest.question_4_response || '',
              q5: latest.question_5_response || '',
              q6: latest.question_6_response || '',
              q7: latest.question_7_response || '',
              q8: latest.question_8_response || '',
            })
          }
          // Show questions section
          setShowQuestions(true)
          console.log('✅ Sync: Showing questions - status:', latest.status)
        }

        // Update isCompleted state if session is initiated (process started)
        if (latest.status === 'initiated' && !isCompleted) {
          setIsCompleted(true)
          console.log('✅ Sync: Session marked as initiated (process started)')
        }

        // Only log, don't change state here to avoid conflicts with button handler
        console.log('📡 Sync detected status:', latest.status)
        console.log('📡 Sync questions:', {
          q1: latest.question_1_response?.substring(0, 20) || 'empty',
          q2: latest.question_2_response?.substring(0, 20) || 'empty',
          q3: latest.question_3_response?.substring(0, 20) || 'empty',
          q4: latest.question_4_response?.substring(0, 20) || 'empty'
        })
      } catch (error) {
        console.error('Error syncing session:', error)
      }
    }

    // Only sync if not yet completed
    if (!isCompleted) {
      syncSession()
      const interval = setInterval(syncSession, 5000)
      return () => clearInterval(interval)
    }
  }, [sessionData.id, isCompleted, questionsSubmitted])

  // Sync questions from latest session data when currentSessionData changes
  // Only update if user is NOT actively editing (questionsSubmitted = true means view mode)
  useEffect(() => {
    if (currentSessionData && questionsSubmitted) {
      const hasResponses = currentSessionData.question_1_response ||
                          currentSessionData.question_2_response ||
                          currentSessionData.question_3_response ||
                          currentSessionData.question_4_response ||
                          currentSessionData.question_5_response ||
                          currentSessionData.question_6_response ||
                          currentSessionData.question_7_response ||
                          currentSessionData.question_8_response

      if (hasResponses) {
        setQuestions({
          q1: currentSessionData.question_1_response || '',
          q2: currentSessionData.question_2_response || '',
          q3: currentSessionData.question_3_response || '',
          q4: currentSessionData.question_4_response || '',
          q5: currentSessionData.question_5_response || '',
          q6: currentSessionData.question_6_response || '',
          q7: currentSessionData.question_7_response || '',
          q8: currentSessionData.question_8_response || '',
        })
        setShowQuestions(true)
      }
    }
  }, [currentSessionData, questionsSubmitted])

  // Show questions if session is completed or if there are responses
  useEffect(() => {
    const shouldShow = currentSessionData.status === 'completed' ||
                      isCompleted ||
                      currentSessionData.question_1_response || currentSessionData.question_2_response ||
                      currentSessionData.question_3_response || currentSessionData.question_4_response ||
                      currentSessionData.question_5_response || currentSessionData.question_6_response ||
                      currentSessionData.question_7_response || currentSessionData.question_8_response
    if (shouldShow && !showQuestions) {
      console.log('✅ Auto-showing questions section - session completed or has responses')
      setShowQuestions(true)
    }
  }, [currentSessionData.status, isCompleted, currentSessionData.question_1_response, 
      currentSessionData.question_2_response, currentSessionData.question_3_response, 
      currentSessionData.question_4_response, showQuestions])

  // Debug logging
  console.log('🔍 Component state:', {
    isCompleted,
    showQuestions,
    sessionStatus: currentSessionData.status,
    questionsLoaded: questions.q1 || questions.q2 || questions.q3 || questions.q4,
    currentSessionQuestions: {
      q1: currentSessionData.question_1_response?.substring(0, 20) || 'empty',
      q2: currentSessionData.question_2_response?.substring(0, 20) || 'empty'
    }
  })

  useEffect(() => {
    const allCompleted = steps.every(step => step.is_completed)
    setAllStepsCompleted(allCompleted)
  }, [steps])

  const handleStepComplete = async (stepName: string) => {
    try {
      // Update local state IMMEDIATELY for instant feedback
      const updatedSteps = steps.map(step => 
        step.step_name === stepName 
          ? { ...step, is_completed: true }
          : step
      )
      setSteps(updatedSteps)
      
      // Then save to backend
      await completeStep(sessionData.id, stepName)
      
      // Sync with backend to get latest state (with a small delay to ensure backend has saved)
      setTimeout(async () => {
        try {
          const latest = await getInfoSession(sessionData.id)
          setCurrentSessionData(latest)
          // Only update steps if backend confirms the step is completed
          if (latest.steps.find(s => s.step_name === stepName)?.is_completed) {
            setSteps(latest.steps)
          }
        } catch (error) {
          console.error('Error syncing after step complete:', error)
        }
      }, 500)
    } catch (error) {
      console.error('Error completing step:', error)
      // Revert local state if backend call failed
      const revertedSteps = steps.map(step => 
        step.step_name === stepName 
          ? { ...step, is_completed: false }
          : step
      )
      setSteps(revertedSteps)
      alert('Error completing step. Please try again.')
    }
  }

  const finishSession = async () => {
    if (isCompleting || isCompleted) return

    setIsCompleting(true)

    try {
      const response = await completeInfoSession(sessionData.id)
      setIsCompleted(true)
      alert('Session completed successfully!')

      if (onSessionCompleted) {
        onSessionCompleted()
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error completing session')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8" style={{ maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
            Welcome to Kelly Education Miami Dade
          </h1>

          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700 mb-4">
              For our process you must be able to communicate in English, have your Education Proof. 
              If your Education Proof is not from the U.S., you must have the equivalence. 
              If you don't have it, our representatives will inform you how to do it.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Two Forms of Government ID</strong> such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Driver's License</li>
              <li>Social Security Card</li>
              <li>U.S. Passport</li>
              <li>Birth Certificate</li>
              <li>Permanent Resident Card</li>
              <li>Work Permit Card</li>
            </ul>
            <p className="text-gray-700 mt-4 font-semibold">
              Documents must be physical originals, not copies, and must not be expired.
            </p>
          </div>

          <div className="mb-8">
            <div className="bg-white z-50 py-4 mb-4 border-b-2 border-gray-300 shadow-lg" style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'white' }}>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Follow the steps below and check each step as you complete each stage:
              </h2>
              {/* Compact view of all checkboxes when sticky */}
              <div className="flex flex-wrap gap-3 mt-3">
                {steps.map((step, index) => (
                  <div 
                    key={`sticky-step-${step.step_name}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors flex-shrink-0 min-w-fit ${
                      step.is_completed
                        ? 'bg-green-100 border-green-500 shadow-sm'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`sticky-step-${index}`}
                      checked={step.is_completed}
                      onChange={(e) => {
                        e.preventDefault()
                        if (!step.is_completed) {
                          handleStepComplete(step.step_name)
                        }
                      }}
                      className={`w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 ${
                        step.is_completed ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      disabled={step.is_completed}
                      style={{ pointerEvents: step.is_completed ? 'none' : 'auto' }}
                    />
                    <label 
                      htmlFor={`sticky-step-${index}`}
                      className={`text-sm font-semibold cursor-pointer select-none ${
                        step.is_completed ? 'text-green-700' : 'text-gray-700'
                      }`}
                    >
                      Step {index + 1}
                      {step.is_completed && <span className="ml-1">✓</span>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={`${step.step_name}-${index}`}
                  className={`p-6 rounded-lg border-2 ${
                    step.is_completed
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id={`step-${index}`}
                      checked={step.is_completed}
                      onChange={(e) => {
                        e.preventDefault()
                        if (!step.is_completed) {
                          handleStepComplete(step.step_name)
                        }
                      }}
                      className={`mt-1 w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500 ${
                        step.is_completed ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      disabled={step.is_completed}
                      style={{ pointerEvents: step.is_completed ? 'none' : 'auto' }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        Step {index + 1}: {step.step_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-gray-700 mb-2">{step.step_description}</p>
                      <p className="text-sm text-gray-600 italic">
                        By checking this box, I confirm that I have read and understood this section.
                      </p>
                    </div>
                    {step.is_completed && (
                      <span className="text-green-600 font-bold">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allStepsCompleted && !isCompleted && (
            <div className="mt-8 text-center">
              <button
                onClick={async () => {
                  // Show confirmation warning before completing
                  const confirmed = confirm(
                    'IMPORTANT: Please DO NOT click "OK" until the Info Session has been fully completed.\n\n' +
                    'Have you completed the entire Info Session?\n\n' +
                    'Click "OK" only when finished, or "Cancel" to continue the session.'
                  )

                  if (!confirmed) {
                    return // User cancelled, don't complete the session
                  }

                  console.log('🔘 Button clicked - starting completion')
                  setIsCompleting(true)
                  try {
                    const response = await completeInfoSession(sessionData.id)
                    console.log('✅ Completion successful:', response)
                    
                    // Refresh session data FIRST to get latest state
                    const updated = await getInfoSession(sessionData.id)
                    console.log('📝 Refreshed session data - status:', updated.status)
                    
                    // Update all state variables
                    setCurrentSessionData(updated)
                    setSteps(updated.steps)
                    setIsCompleted(true)
                    
                    // Force show questions immediately
                    setShowQuestions(true)
                    
                    // Also update questions from the response
                    if (updated.question_1_response || updated.question_2_response || 
                        updated.question_3_response || updated.question_4_response) {
                      setQuestions({
                        q1: updated.question_1_response || '',
                        q2: updated.question_2_response || '',
                        q3: updated.question_3_response || '',
                        q4: updated.question_4_response || ''
                      })
                    }
                    
                    console.log('📝 Set showQuestions=true, isCompleted=true, status=', updated.status)
                    
                    // Scroll to questions after a brief delay to ensure render
                    setTimeout(() => {
                      const questionsSection = document.querySelector('.questions-section')
                      if (questionsSection) {
                        questionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        console.log('✅ Scrolled to questions section')
                      } else {
                        console.warn('⚠️ Questions section not found in DOM after 200ms')
                      }
                    }, 300)
                  } catch (err: any) {
                    console.error('❌ Completion error:', err)
                    alert('Error: ' + (err.message || 'Unknown error'))
                    setIsCompleting(false)
                  }
                }}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl disabled:opacity-50"
              >
                {isCompleting ? 'Wait...' : 'COMPLETE SESSION'}
              </button>
            </div>
          )}

          {/* Always show questions section if showQuestions is true OR if session is completed */}
          {(() => {
            const shouldShow = showQuestions || isCompleted || currentSessionData.status === 'completed'
            console.log('🎯 Rendering questions check:', {
              showQuestions,
              isCompleted,
              allStepsCompleted,
              sessionStatus: currentSessionData.status,
              shouldShow,
              condition1: showQuestions,
              condition2: isCompleted,
              condition3: currentSessionData.status === 'completed'
            })
            return shouldShow
          })() ? (
            <div className="questions-section mt-8 p-6 bg-blue-50 border-2 border-blue-500 rounded-lg">
              {questionsSubmitted ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-700 mb-2">Answers Submitted Successfully</h2>
                  <p className="text-gray-600 mb-6">Your answers have been saved. If you need to make changes, click the button below.</p>
                  <button
                    onClick={() => setQuestionsSubmitted(false)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
                  >
                    Edit & Resubmit Answers
                  </button>
                </div>
              ) : (
              <>
              <h2 className="text-2xl font-bold mb-6 text-blue-900">Please Answer These Questions:</h2>

              <div className="space-y-6">
                {isParaprofessional ? (
                  <>
                    {[
                      { key: 'q1', label: '1. What interests you in working as a Paraprofessional?' },
                      { key: 'q2', label: '2. Can you describe any experience you have working with students with special needs (e.g. autism, behavioral needs, physical disabilities)?' },
                      { key: 'q3', label: '3. How would you handle a situation where a student becomes frustrated, overwhelmed or displays challenging behavior?' },
                      { key: 'q4', label: '4. How do you support a student who is struggling academically while also keeping them engaged and confident?' },
                      { key: 'q5', label: '5. Are you comfortable providing one-on-one (1:1) support to students throughout the school day, including academic and behavioral support?' },
                      { key: 'q6', label: '6. Are you comfortable working in a religious school environment, and maintaining professionalism within that setting?' },
                      { key: 'q7', label: '7. This role requires consistent attendance Monday through Friday, with varying hours depending on the school. Can you fully commit to that schedule through the end of the school year?' },
                      { key: 'q8', label: '8. Where are you currently based, and what is your flexibility in commuting to different school locations if needed?' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-gray-800 font-semibold mb-2">{label}</label>
                        <textarea
                          value={questions[key as keyof typeof questions]}
                          onChange={(e) => {
                            setQuestions({ ...questions, [key]: e.target.value })
                            e.target.style.height = 'auto'
                            e.target.style.height = e.target.scrollHeight + 'px'
                          }}
                          rows={5}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base leading-relaxed resize-none overflow-hidden"
                          placeholder="Type your answer here..."
                          style={{ minHeight: '120px' }}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { key: 'q1', label: '1. Tell me about a time where you were asked to sub for another instructor or were asked to fill in for someone and the instructions were either missing or illegible. What did you do in this situation? What was the outcome? Would you handle this situation differently and why?' },
                      { key: 'q2', label: '2. Tell me about a time when you lost order or control either in a classroom or similar environment. What did you do to regain the students\' or group\'s attention? What was the outcome of your efforts? How would you handle this situation differently based on the outcome and why?' },
                      { key: 'q3', label: '3. What would you do if you had warned a student about his/her behavior and the student continued to misbehave?' },
                      { key: 'q4', label: '4. If you disagreed with the policies or procedures of the school/school district/Center in which you were working, what would you do?' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-gray-800 font-semibold mb-2">{label}</label>
                        <textarea
                          value={questions[key as keyof typeof questions]}
                          onChange={(e) => {
                            setQuestions({ ...questions, [key]: e.target.value })
                            e.target.style.height = 'auto'
                            e.target.style.height = e.target.scrollHeight + 'px'
                          }}
                          rows={6}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base leading-relaxed resize-none overflow-hidden"
                          placeholder="Type your answer here... The box will grow as you type."
                          style={{ minHeight: '150px' }}
                        />
                      </div>
                    ))}
                  </>
                )}

                <div className="text-center pt-4 flex justify-center gap-4">
                  <button
                    onClick={async () => {
                      try {
                        const hasAnyAnswer = Object.values(questions).some(v => v.trim())
                        if (!hasAnyAnswer) {
                          alert('Please answer at least one question before submitting.')
                          return
                        }

                        const questionsData = {
                          question_1_response: questions.q1.trim() || undefined,
                          question_2_response: questions.q2.trim() || undefined,
                          question_3_response: questions.q3.trim() || undefined,
                          question_4_response: questions.q4.trim() || undefined,
                          question_5_response: questions.q5.trim() || undefined,
                          question_6_response: questions.q6.trim() || undefined,
                          question_7_response: questions.q7.trim() || undefined,
                          question_8_response: questions.q8.trim() || undefined,
                        }

                        await updateInterviewQuestions(sessionData.id, questionsData)

                        const updated = await getInfoSession(sessionData.id)
                        setCurrentSessionData(updated)
                        setQuestions({
                          q1: updated.question_1_response || '',
                          q2: updated.question_2_response || '',
                          q3: updated.question_3_response || '',
                          q4: updated.question_4_response || '',
                          q5: updated.question_5_response || '',
                          q6: updated.question_6_response || '',
                          q7: updated.question_7_response || '',
                          q8: updated.question_8_response || '',
                        })

                        alert('Questions submitted successfully! Thank you.')
                        setQuestionsSubmitted(true)
                      } catch (error: any) {
                        console.error('Error saving questions:', error)
                        alert(`Error saving questions: ${error.response?.data?.detail || error.message || 'Unknown error'}. Please try again.`)
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
              </>
              )}
            </div>
          ) : null}

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoSessionWelcome


