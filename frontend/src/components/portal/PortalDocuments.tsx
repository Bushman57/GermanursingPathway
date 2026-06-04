import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortalDocumentsQuery, useUploadPortalDocumentMutation } from "@/lib/queries/portal";
import { toast } from "sonner";

const DOC_TYPES = [
  "passport",
  "diploma",
  "transcript",
  "german_certificate",
  "cv",
  "other",
] as const;

export function PortalDocuments() {
  const { t } = useTranslation("portal");
  const { data: docs = [], isLoading } = usePortalDocumentsQuery();
  const upload = useUploadPortalDocumentMutation();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const uploadedTypes = new Set(docs.map((d) => d.docType));

  const onFile = async (docType: string, file: File | undefined) => {
    if (!file) return;
    try {
      await upload.mutateAsync({ docType, file });
      toast.success(t("documents.uploaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("documents.error"));
    }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-warm" />
        {t("documents.title")}
      </h2>
      <p className="text-sm text-muted-foreground mt-1 mb-5">{t("documents.subtitle")}</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> {t("documents.loading")}
        </p>
      ) : (
        <ul className="space-y-3">
          {DOC_TYPES.map((type) => {
            const done = uploadedTypes.has(type);
            const latest = docs.find((d) => d.docType === type);
            return (
              <li
                key={type}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border"
              >
                <div>
                  <div className="font-medium text-sm">{t(`documents.types.${type}`)}</div>
                  {latest && (
                    <div className="text-xs text-muted-foreground mt-0.5">{latest.filename}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={(el) => {
                      inputRefs.current[type] = el;
                    }}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => onFile(type, e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant={done ? "outline" : "warm"}
                    size="sm"
                    disabled={upload.isPending}
                    onClick={() => inputRefs.current[type]?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {done ? t("documents.replace") : t("documents.upload")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
