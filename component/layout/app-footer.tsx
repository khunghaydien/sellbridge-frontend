import { Link, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
export default function AppFooter() {
  const t = useTranslations();
  return (
    <div className="py-6 border-t border-border">
      <div className="flex gap-2 items-center justify-center">
        <Typography className="text-muted-foreground text-xs">
          {t("copyright")}
        </Typography>
        <div>
          <Link
            href="/privacy-policy"
            className="text-xs text-primary"
          >
            {t("privacy_policy")}
          </Link>
        </div>
      </div>
    </div>
  );
}