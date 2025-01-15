export function ExerciseSearch({
  searchTerm,
  onSearchTerm,
}: {
  searchTerm: string;
  onSearchTerm: (searchTerm: string) => void;
}) {
  return (
    <>
      <form>
        <input
          className="rounded-lg border bg-card px-2 py-1 text-accent"
          type="search"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => onSearchTerm(e.target.value)}
        ></input>
      </form>
    </>
  );
}
