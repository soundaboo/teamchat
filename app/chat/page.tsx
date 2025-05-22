export default function ChatHomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
      <div className="text-6xl mb-4">👋</div>
      <h1 className="text-2xl font-bold mb-2">Welcome to TeamChat!</h1>
      <p className="max-w-md mb-6">
        Select a channel or direct message to start chatting with your team.
      </p>
    </div>
  );
}