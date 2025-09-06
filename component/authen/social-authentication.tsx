import { IconFacebook, IconGoogle } from "@/icon";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import Link from "next/link";
export default function SocialSignIn() {
    const t = useTranslations();
    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="p-2 text-muted-foreground bg-background">
                        {t('or')}
                    </span>
                </div>
            </div>
            <div className="flex gap-4 w-full">
                <Button variant="contained" color="inherit" fullWidth className="flex items-center gap-2">
                    <IconGoogle />
                    {t("google")}
                </Button>
                <Button variant="contained" color="inherit" fullWidth className="flex items-center gap-2">
                    <IconFacebook />
                    {t("facebook")}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
                {t("by_continuing")}
                <Link href="/terms-and-policies" className="text-primary ml-1">
                    {t("terms_and_policies")}
                </Link>
                .
            </p>
        </div>
    )
}