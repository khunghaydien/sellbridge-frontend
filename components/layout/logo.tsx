import Image from "next/image"

export default function Logo() {
    return (
        <div className="flex items-center gap-2">
            <Image 
                src="/logo/logo.svg" 
                alt="Logo" 
                width={32} 
                height={32}
                className="w-8 h-8"
            />
        </div>
    )
}
