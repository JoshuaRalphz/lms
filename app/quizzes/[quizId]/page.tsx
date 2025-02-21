"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuestionState } from "@/components/quiz/QuestionStateManager";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type QuizWithQuestions = {
  id: string;
  title: string;
  difficulty: string;
  attempts: number;
  questions: {
    id: string;
    question: string;
    options: string;
    correctAnswer: number | string;
    type: "multiple-choice" | "true-false" | "short-answer";
  }[];
};

const TakeQuizPage = ({ params }: { params: { quizId: string } }) => {
  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedAnswers,
    setSelectedAnswers,
    quiz
  } = useQuestionState(params.quizId);

  const [score, setScore] = useState<number | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(() => {
    // 15 minutes (900 seconds) for 10 questions
    const baseTime = 900;
    return baseTime;
  });
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const attemptCounted = useRef(false);
  const { userId } = useAuth();
  const router = useRouter();
  const [showQuizInfo, setShowQuizInfo] = useState(true);

  const calculateScore = useCallback(async (answers: (number | string)[]) => {
    if (!quiz) {
      return;
    }
    
    const correctAnswers = quiz.questions.reduce((acc, question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;

      if (userAnswer === null || userAnswer === undefined) {
        return acc;
      }

      const userAnswerStr = userAnswer.toString().trim().toLowerCase();
      const correctAnswerStr = correctAnswer.toString().trim().toLowerCase();

      return acc + (userAnswerStr === correctAnswerStr ? 1 : 0);
    }, 0);
    
    const scorePercentage = correctAnswers / quiz.questions.length;

    // Create quiz attempt
    await fetch('/api/quiz-attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quizId: quiz.id,
        score: scorePercentage
      })
    });

    // Update quiz statistics
    await fetch(`/api/quizzes/${quiz.id}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score: scorePercentage }),
    });

    setScore(correctAnswers);
    setShowCorrectAnswers(true);
  }, [quiz]);

  useEffect(() => {
    if (timeLeft > 0 && score === null) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      calculateScore(selectedAnswers);
    }
  }, [timeLeft, score, calculateScore, selectedAnswers]);

  useEffect(() => {
    if (quiz && !attemptCounted.current) {
      attemptCounted.current = true;
      fetch(`/api/quizzes/${quiz.id}/attempts`, { method: 'POST' });
    }
  }, [quiz]);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswer = (answerIndex: number | string) => {
    const newSelectedAnswers = [...selectedAnswers];
    const answer = typeof answerIndex === 'number' 
      ? answerIndex.toString() 
      : answerIndex.trim().toLowerCase();
    newSelectedAnswers[currentQuestionIndex] = answer;
    
    setSelectedAnswers(newSelectedAnswers);
    setShortAnswer("");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (showQuizInfo) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 mx-auto">
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Questions</span>
              <span>{quiz.questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Difficulty</span>
              <Badge variant="outline">
                {quiz?.difficulty || "Unknown"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time Limit</span>
              <span>15 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Attempts</span>
              <span>{quiz.attempts}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => router.push('/quizzes')}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowQuizInfo(false)}
              className="bg-primary hover:bg-accent text-white"
            >
              Take Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (score !== null) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Assessment Results</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Your Score</p>
            <p className="text-2xl font-bold">{score}/{quiz.questions.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Time Taken</p>
            <p className="text-2xl font-bold">{formatTime(900 - timeLeft)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const isCorrect = selectedAnswers[index]?.toString().toLowerCase() === 
              question.correctAnswer.toString().toLowerCase();
            
            return (
              <div key={index} className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Question {index + 1}</p>
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-correct text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-incorrect text-red-500" />
                  )}
                </div>
                <p className="mb-2">{question.question}</p>
                {showCorrectAnswers && (
                  <p className="text-sm text-gray-500">
                    Correct Answer: {question.type === 'multiple-choice' 
                      ? question.options?.split('|')[Number(question.correctAnswer)]
                      : question.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Link href="/quizzes">
            <Button className="w-full">Return</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 bg-blue-50 min-h-screen flex flex-col justify-center space-y-6">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 text-black">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
          <Badge variant="outline" className="bg-background text-black">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Badge>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg shadow-md flex-1 flex flex-col border border-blue-200">
          <div className="mb-4 flex-shrink-0">
            <Progress 
              value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} 
              className="h-2 bg-blue-200"
            />
          </div>

          <h3 className="text-lg font-semibold text-text mb-4 flex-shrink-0">
            {currentQuestion.question}
          </h3>

          {currentQuestion.type === "short-answer" ? (
            <div className="space-y-4">
              <Input
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                placeholder="Type your answer here"
                className="w-full bg-background text-text border-border focus:border-border"
              />
              <Button
                onClick={() => handleAnswer(shortAnswer)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Submit Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {currentQuestion.options?.split('|').map((option, index) => (
                <Button
                  key={index}
                  variant={
                    selectedAnswers[currentQuestionIndex] === index.toString() 
                      ? "default" 
                      : "outline"
                  }
                  className={`
                    w-full justify-start px-6 py-4 text-left 
                    transition-all duration-200
                    ${
                      selectedAnswers[currentQuestionIndex] === index.toString()
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-background hover:bg-secondary border-border hover:border-accent hover:shadow-sm text-text"
                    }
                  `}
                  onClick={() => handleAnswer(index)}
                >
                  <span className="mr-4 font-medium text-text">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-text">{option}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between flex-shrink-0">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Previous
          </Button>
          <Button
            variant={currentQuestionIndex === quiz.questions.length - 1 ? "default" : "outline"}
            onClick={() => {
              if (currentQuestionIndex === quiz.questions.length - 1) {
                calculateScore(selectedAnswers);
              } else {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? "Submit Quiz" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeQuizPage; 