
const DateDisplay = ({
    date
}: { date: Date | string }) => {

    const dateObj = date instanceof Date ? date : new Date(date);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = dateObj.toLocaleString("default", { month: "short" });

    return (
        <div className="flex flex-col items-center justify-center bg-background border border-border/50 rounded-md shrink-0 w-9 h-10 shadow-sm mt-1 mb-1 relative overflow-hidden group">
            <div className="absolute top-0 w-full h-1.5 bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
            <span className="text-xs font-bold leading-none mt-1 group-hover:text-primary transition-colors">
                {day}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase font-semibold mt-0.5 tracking-wider">
                {month}
            </span>
        </div>
    )
}

export default DateDisplay