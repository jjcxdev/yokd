import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsStopwatch } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoMdMore } from "react-icons/io";
import { IoAddCircle } from "react-icons/io5";

import SecondaryButton from "@/app/components/SecondaryButton";
import type { Exercise } from "@/lib/db/schema";

interface ExerciseRoutineCardProps {
  exercise: Exercise;
  onUpdate: (exerciseData: {
    exerciseId: string;
    notes: string;
    sets: Array<{
      weight: string;
      reps: string;
    }>;
  }) => void;
}

export default function ExceriseRoutineCard({
  exercise,
  onUpdate,
}: ExerciseRoutineCardProps) {
  interface Set {
    id: number;
    weight: string;
    reps: string;
  }

  const [sets, setSets] = useState([{ id: 1, weight: "", reps: "" }]);
  const [notes, setNotes] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Memoize the data transformation
  const currentData = useMemo(
    () => ({
      exerciseId: exercise.id,
      notes,
      sets: sets.map(({ weight, reps }) => ({ weight, reps })),
    }),
    [sets, notes, exercise.id],
  );

  // Only update parent when currentData actually changes
  useEffect(() => {
    // Debounce the update
    const timeoutId = setTimeout(() => {
      onUpdate(currentData);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentData, onUpdate]);

  function addSet() {
    setSets((prevSets) => [
      ...prevSets,
      {
        id: prevSets.length + 1,
        weight: "",
        reps: "",
      },
    ]);
  }

  function updateSet(
    id: number,
    field: keyof Omit<Set, "id">,
    value: string,
  ): void {
    setSets(
      sets.map((set) => (set.id === id ? { ...set, [field]: value } : set)),
    );
  }

  function deleteSet(id: number): void {
    if (sets.length <= 1) return;

    const filteredSets = sets.filter((set) => set.id !== id);

    const reindexedSets = filteredSets.map((set, index) => ({
      ...set,
      id: index + 1,
    }));

    setSets(reindexedSets);
  }

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [notes]);

  return (
    <div className="rounded-lg bg-card p-4">
      {/* Exercise Label */}

      <div className="flex w-full flex-col">
        <div className="flex w-full justify-between">
          <h1 className="text-xl font-bold">{exercise.name}</h1>
          <div className="text-2xl">
            <IoMdMore />
          </div>
        </div>
        <div>
          <form className="h-full w-full">
            <textarea
              ref={textareaRef}
              className="h-auto min-h-[2.5rem] w-full resize-none bg-transparent text-sm"
              rows={1}
              placeholder="Add routine notes here"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Rest Timer */}

      <div className="flex items-center gap-2 py-4 text-accent">
        <BsStopwatch />
        <p>Rest Timer:</p>
        <div>90s</div>
      </div>

      {/* Set details header */}

      <div className="flex w-full text-xs uppercase text-dimmed">
        <div className="flex w-1/4 justify-start">Set</div>
        <div className="flex w-1/4 justify-center">Lbs</div>
        <div className="flex w-1/4 justify-center">Reps</div>
        <div className="flex w-1/4 justify-center"></div>
      </div>

      {/* Dynamic sets */}

      {sets.map((set) => (
        <div key={set.id} className="flex w-full">
          <div className="flex w-1/4 justify-start text-sm">{set.id}</div>
          <div className="flex w-1/4 justify-center">
            <form className="w-full">
              <input
                className="w-full bg-transparent text-center text-sm"
                type="text"
                placeholder="-"
                value={set.weight}
                onChange={(e) => updateSet(set.id, "weight", e.target.value)}
              />
            </form>
          </div>
          <div className="flex w-1/4 justify-center">
            <form className="w-full">
              <input
                className="flex w-full bg-transparent text-center text-sm"
                type="text"
                placeholder="-"
                value={set.reps}
                onChange={(e) => updateSet(set.id, "reps", e.target.value)}
              ></input>
            </form>
          </div>
          <div className="flex w-1/4 justify-end">
            <button
              className="text-sm text-remove"
              onClick={() => deleteSet(set.id)}
              disabled={sets.length <= 1}
            >
              <FaRegTrashCan />
            </button>
          </div>
        </div>
      ))}

      {/* Add Set Button */}

      <div className="flex w-full justify-center">
        <div className="w-full pt-4">
          <SecondaryButton
            icon={<IoAddCircle />}
            label={"Add set"}
            variant="dark"
            onClick={addSet}
          />
        </div>
      </div>
    </div>
  );
}
