"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { z } from "zod";

interface Question {
  type: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options: string[];
  correctAnswer: number | string;
}

interface QuizBuilderProps {
  categories: {
    label: string;
    value: string;
  }[];
  quizId?: string;
}

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  type: z.enum(["multiple-choice", "true-false", "short-answer"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()])
});

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  categoryId: z.string().optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required")
});

const QuizBuilder = ({ categories, quizId }: QuizBuilderProps) => {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState(quizId ? "" : "");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(!!quizId);

  useEffect(() => {
    if (quizId) {
      const fetchQuiz = async () => {
        try {
          const response = await fetch(`/api/quizzes/${quizId}`);
          const data = await response.json();
          setQuizTitle(data.title);
          setDifficulty(data.difficulty);
          setSelectedCategory(data.categoryId || "");
          setQuestions(data.questions.map((q: any) => ({
            ...q,
            options: q.options ? q.options.split('|') : [],
            correctAnswer: q.type === 'short-answer' ? q.correctAnswer : Number(q.correctAnswer)
          })));
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch quiz", error);
          setIsLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [quizId]);

  const addQuestion = () => {
    const baseQuestion = {
      question: "",
      type: "multiple-choice" as const, // Default type
    };

    setQuestions([...questions, {
      ...baseQuestion,
      options: ["", "", "", ""],
      correctAnswer: 0
    }]);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[questionIndex];

    // Allow changes for multiple-choice questions
    if (currentQuestion.type === "multiple-choice") {
      updatedQuestions[questionIndex].options[optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };

  const handleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(updatedQuestions);
  };

  const saveQuiz = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const quizData = {
        title: quizTitle,
        description: "",
        difficulty,
        categoryId: selectedCategory,
        questions
      };

      // Validate the quiz data
      const validatedData = quizSchema.parse(quizData);

      // First, create the quiz
      const quizResponse = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.text();
        throw new Error(errorData);
      }

      const quiz = await quizResponse.json();

      // Show success feedback
      toast.success("Quiz created successfully!");
      
      // Clear the form
      setQuizTitle("");
      setQuestions([]);
      
    } catch (error) {
      console.error("Error saving quiz:", error);
      setError(error instanceof Error ? error.message : "Failed to save quiz");
      toast.error("Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      toast.success("Quiz deleted successfully!");
      router.push('/');
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Quiz Title</label>
        <Input
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Enter quiz title"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Difficulty Level</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
          className="border rounded-lg p-2 w-full"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg p-2 w-full"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {questions.map((q, questionIndex) => (
        <div key={questionIndex} className="border p-4 rounded-lg relative">
          <button
            onClick={() => deleteQuestion(questionIndex)}
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
          >
            <Trash className="w-4 h-4 text-red-500" />
          </button>
          <h3 className="font-semibold mb-2">Question {questionIndex + 1}</h3>
          <Textarea
            placeholder="Enter your question"
            className="mb-4"
            value={q.question}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[questionIndex].question = e.target.value;
              setQuestions(updatedQuestions);
            }}
          />
          
          {/* Question Type Selector */}
          <select
            value={q.type}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              const newType = e.target.value as "multiple-choice" | "true-false" | "short-answer";
              
              updatedQuestions[questionIndex].type = newType;
              
              // Update options based on type
              if (newType === "multiple-choice") {
                updatedQuestions[questionIndex].options = ["", "", "", ""];
                updatedQuestions[questionIndex].correctAnswer = 0;
              } else if (newType === "true-false") {
                updatedQuestions[questionIndex].options = ["True", "False"];
                updatedQuestions[questionIndex].correctAnswer = 0;
              } else {
                updatedQuestions[questionIndex].options = [];
                updatedQuestions[questionIndex].correctAnswer = "";
              }
              
              setQuestions(updatedQuestions);
            }}
            className="mb-4 p-2 border rounded"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="short-answer">Short Answer</option>
          </select>

          {q.type === "multiple-choice" || q.type === "true-false" ? (
            <div className="space-y-2">
              {q.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <button
                    onClick={() => handleCorrectAnswer(questionIndex, optionIndex)}
                    className={`p-2 rounded-full border ${
                      q.correctAnswer === optionIndex 
                        ? 'bg-green-500 border-green-600' 
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Input
              value={q.correctAnswer as string || ""}
              onChange={(e) => {
                const updatedQuestions = [...questions];
                updatedQuestions[questionIndex].correctAnswer = e.target.value;
                setQuestions(updatedQuestions);
              }}
              placeholder="Enter the correct answer"
              className="mb-4"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <Button onClick={addQuestion} disabled={isSaving}>
          Add Question
        </Button>
      </div>
      <div className="flex justify-end gap-2">
        {quizId && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSaving}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Quiz
          </Button>
        )}
        <Button 
          onClick={saveQuiz} 
          disabled={isSaving || questions.length === 0 || !quizTitle.trim()}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Quiz"
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuizBuilder; 