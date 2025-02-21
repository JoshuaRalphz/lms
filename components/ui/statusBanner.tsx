import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Rocket, TriangleAlert, CheckCircle } from "lucide-react";

interface AlertBannerProps {
  isCompleted: boolean;
  isPublished: boolean;
  requiredFieldsCount: number;
  missingFieldsCount: number;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  isCompleted,
  isPublished,
  requiredFieldsCount,
  missingFieldsCount,
}) => {
  return (
    <Alert
      className={`my-4 p-4 rounded-lg border shadow-md transition-all duration-300 ${
        isPublished
          ? "bg-green-100 border-green-500 text-green-800"
          : isCompleted
          ? "bg-blue-100 border-blue-500 text-blue-800"
          : "bg-red-100 border-red-500 text-red-800"
      } flex items-center gap-3`}
    >
      <div className="flex items-center gap-2">
        {isPublished ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : isCompleted ? (
          <Rocket className="h-5 w-5 text-blue-600" />
        ) : (
          <TriangleAlert className="h-5 w-5 text-red-600" />
        )}
        <div>
          <AlertTitle className="text-sm font-semibold">
            {isPublished
              ? "🎉 Course is Published!"
              : isCompleted
              ? "🚀 Ready to Publish!"
              : `⚠️ ${missingFieldsCount} field(s) missing / ${requiredFieldsCount} required`}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {isPublished
              ? "Your course is now live and available to students! 🎉"
              : isCompleted
              ? "Great job! Just hit 'Publish' to make your course live."
              : "You can only publish when all required fields are completed."}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default AlertBanner;