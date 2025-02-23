import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizAttempt {
  id: string;
  score: number;
  createdAt: Date;
  quiz: {
    id: string;
    title: string;
    questions: { id: string }[];
  };
}

interface QuizAttemptsSectionProps {
  attempts: QuizAttempt[];
  emptyMessage: string;
  buttonText: string;
  href: string;
}

export default function QuizAttemptsSection({
  attempts,
  emptyMessage,
  buttonText,
  href
}: QuizAttemptsSectionProps) {
  // Get only the latest attempt for each quiz
  const latestAttempts = attempts.reduce((acc, attempt) => {
    const existing = acc.find(a => a.quiz.id === attempt.quiz.id);
    if (!existing || new Date(attempt.createdAt) > new Date(existing.createdAt)) {
      return [
        ...acc.filter(a => a.quiz.id !== attempt.quiz.id),
        attempt
      ];
    }
    return acc;
  }, [] as QuizAttempt[]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Assessments Takes</h2>
        <Link href={href} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            {buttonText}
          </Button>
        </Link>
      </div>
      
      {latestAttempts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestAttempts.map((attempt) => {
            const score = Math.round(attempt.score * attempt.quiz.questions.length);
            const isPassing = score >= (attempt.quiz.questions.length * 0.7);

            return (
              <Card key={attempt.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{attempt.quiz.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        isPassing ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {score}/{attempt.quiz.questions.length}
                      </span>
                      {isPassing ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(attempt.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                  <Link href={`/quizzes/${attempt.quiz.id}`}>
                    <Button variant="outline" className="w-full">
                      Retake 
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{emptyMessage}</p>
          <Link href={href}>
            <Button>{buttonText}</Button>
          </Link>
        </div>
      )}
    </section>
  );
} 