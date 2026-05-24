import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowBigRight, ArrowBigRightDash, ArrowRight, ArrowRightSquare, ChevronRight } from "lucide-react"
import Link from "next/link"

export const DetailsCard = ({ id, code, name, description }: { id: string, code: string, name: string, description: string }) => {

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold overflow-hidden text-ellipsis whitespace-nowrap"> 
                    {name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-muted-foreground">
                    {description}
                </CardDescription>
                <CardAction >
                    <Link href={`department/${id}`} className="flex items-center justify-center gap-2 cursor-pointer font-semibold">
                        {code}
                        <ChevronRight />
                    </Link>
                </CardAction>
            </CardHeader>
        </Card>
    )
}