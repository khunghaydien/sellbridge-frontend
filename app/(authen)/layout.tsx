import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/component/theme/theme-toggle";
import AppFooter from "@/component/layout/app-footer";
import { useTranslations } from "next-intl";

export default function layout({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    return (
        <div className="relative p-6 bg-background z-1 sm:p-0">
            <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col bg-background sm:p-0">
                <div className="w-full h-full flex flex-col mx-auto">
                    <div className="flex items-center justify-center py-6 max-w-lg mx-auto w-full h-full">
                        {children}
                    </div>
                    <AppFooter />
                </div>
                <div className="w-full h-full">
                    <div className="w-full h-full bg-black/5 dark:bg-white/5 lg:grid items-center hidden">
                        <div className="relative items-center justify-center  flex z-1">
                            <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
                                <Image
                                    width={540}
                                    height={254}
                                    src="/shape/grid-01.svg"
                                    alt="grid"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
                                <Image
                                    width={540}
                                    height={254}
                                    src="/shape/grid-01.svg"
                                    alt="grid"
                                />
                            </div>
                            <div className="flex flex-col items-center max-w-xs">
                               <h1 className="text-[40px] font-bold text-primary">SELLBRIDGE</h1>
                            </div>
                        </div>
                    </div>
                    <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    )
}