"use client"

import { useState, useEffect } from "react";

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

export const useQuestionState = (quizId: string) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | string)[]>([]);
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const response = await fetch(`/api/quizzes/${quizId}`);
      const data = await response.json();
      setQuiz(data);
      setSelectedAnswers(new Array(data.questions.length).fill(null));
    };
    fetchQuiz();
  }, [quizId]);

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedAnswers,
    setSelectedAnswers,
    quiz
  };
}; 