import { Loader2 } from "lucide-react";

interface Props {
  loading?: boolean;
  text?: string;
}

const RouteLoaderOverlay = ({ loading = false, text = "Loading..." }: Props) => {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="flex items-center gap-3 text-foreground bg-card/80 rounded-md px-4 py-3 shadow">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-medium">{text}</span>
      </div>
    </div>
  );
};

export default RouteLoaderOverlay;
