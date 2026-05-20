interface HeaderProps {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps){
  return(
  <div className="flex w-full h-16 justify-between items-center px-8  border-r border-b">
    <div className="flex flex-col">
      <span className="text-sm font-semibold">{ title }</span>
      <span className="text-xs text-zinc-600">{ subtitle }</span>
    </div>
  </div>
  )
}