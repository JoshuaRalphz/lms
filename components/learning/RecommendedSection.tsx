import Link from "next/link";
import { EmptyState } from "./EmptyState";
import { Button } from "../ui/button";

interface RecommendedSectionProps {
  title: string;
  items: any[];
  emptyMessage: string;
  buttonText: string;
  href: string;
  renderItem: (item: any) => React.ReactNode;
}

export default function RecommendedSection(props: RecommendedSectionProps) {
  const { title, items, emptyMessage, buttonText, href, renderItem } = props;

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        <Link href={href} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            {buttonText}
          </Button>
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map(renderItem)}
        </div>
      ) : (
        <EmptyState 
          message={emptyMessage}
          buttonText={buttonText}
          href={href}
        />
      )}
    </section>
  );
} 