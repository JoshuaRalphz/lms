"use client";

import { Quiz } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DeleteQuiz } from "./DeleteQuiz";

export const columns: ColumnDef<Quiz>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty") as string;
      return (
        <Badge
          className={
            difficulty === "Beginner"
              ? "bg-green-100 text-green-800"
              : difficulty === "Intermediate"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }
        >
          {difficulty}
        </Badge>
      );
    },
  },
  {
    accessorKey: "questions",
    header: "Questions",
    cell: ({ row }) => {
      const questions = row.getValue("questions") as any[];
      return <span>{questions.length}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link
          href={`/instructor/quiz/${row.original.id}`}
          className="flex gap-2 items-center hover:text-[#A9B5DF]"
        >
          {/* <Pencil className="h-4 w-4" /> Edit */}
        </Link>
        <DeleteQuiz quizId={row.original.id} />
      </div>
    ),
  },
]; 