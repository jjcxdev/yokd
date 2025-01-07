// app/test/page.tsx
async function TestPage() {
  // This promise never resolves, keeping the page in a perpetual loading state
  await new Promise(() => {});

  // This code is never reached
  return null;
}

export default TestPage;
