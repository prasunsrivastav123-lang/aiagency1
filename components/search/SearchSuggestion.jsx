export default function SearchSuggestion({

icon,

title,

subtitle,

onClick

}){

return(

<button

onClick={onClick}

className="w-full px-4 py-3 hover:bg-muted flex items-center gap-3 text-left"

>

<div>

<div className="font-medium">

{title}

</div>

<div className="text-xs text-muted-foreground">

{subtitle}

</div>

</div>

</button>

)

}