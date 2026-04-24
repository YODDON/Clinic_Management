import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DetailItem = {
  label: string;
  value: string;
};

type DetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  items: DetailItem[];
};

const CP1252_REVERSE_MAP: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function decodeUtf8FromMojibake(value: string) {
  const bytes: number[] = [];

  for (const char of value) {
    const codePoint = char.charCodeAt(0);

    if (codePoint <= 0xff) {
      bytes.push(codePoint);
      continue;
    }

    const mappedByte = CP1252_REVERSE_MAP[codePoint];
    if (mappedByte === undefined) {
      return value;
    }

    bytes.push(mappedByte);
  }

  try {
    const decoded = new TextDecoder("utf-8").decode(Uint8Array.from(bytes));
    return decoded.includes("\uFFFD") ? value : decoded;
  } catch {
    return value;
  }
}

function fixMojibake(value: string) {
  if (!/[ÃƒÃ‚Ã„Ã†Ã¡Â»Ã¢]/.test(value)) {
    return value;
  }

  let current = value;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const decoded = decodeUtf8FromMojibake(current);
    if (decoded === current) {
      break;
    }
    current = decoded;
  }

  return current;
}

function isLongContent(value: string) {
  const normalized = fixMojibake(value);
  return normalized.length > 72 || normalized.includes("\n");
}

export function DetailDialog({ open, onOpenChange, title, description, items }: DetailDialogProps) {
  const safeTitle = fixMojibake(title);
  const safeDescription = description ? fixMojibake(description) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden border border-slate-200 bg-[#eef9ff] p-0 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:max-w-4xl sm:rounded-3xl">
        <DialogHeader className="shrink-0 px-7 pb-5 pt-7 text-left">
          <DialogTitle className="text-[2rem] font-semibold tracking-tight text-slate-800">
            {safeTitle}
          </DialogTitle>
          {safeDescription && (
            <DialogDescription className="mt-2 text-base text-slate-600">
              {safeDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7 pr-4">
          <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
            {items.map((item) => {
              const safeLabel = fixMojibake(item.label);
              const safeValue = fixMojibake(item.value);
              const longContent = isLongContent(safeValue);

              return (
                <div
                  key={item.label}
                  className={cn("space-y-2", longContent && "sm:col-span-2")}
                >
                  <div className="text-[0.95rem] font-semibold text-slate-800">{safeLabel}</div>
                  <div
                    className={cn(
                      "rounded-2xl border border-slate-200 bg-white px-4 text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.85)]",
                      longContent ? "min-h-24 py-3 text-sm leading-6" : "min-h-12 py-2.5 text-lg leading-7",
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">{safeValue}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
