import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle } from "lucide-react";


const bannerVariants = cva(
  "border text-center p-4 text-sm items-center w-full flex",
  {
    variants: {
      variant: {
        warning: "bg-yellow-200/80 border-yellow-300 text-primary",
        success: "bg-green-700 border-green-800 text-white",
      }
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

interface BannerProps extends VariantProps<typeof bannerVariants>{
  label: string;
}

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
}

export const Banner = ({ label, variant } :  BannerProps ) => {
  const Icon = iconMap[variant || "warning"];


  return (
    <div className={cn(bannerVariants({ variant }))}>
      <Icon className="h-4 w-4 mr-2" />
      {label}
      
    </div>
  )
}