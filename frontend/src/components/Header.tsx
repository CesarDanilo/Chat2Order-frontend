interface HeaderProps {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps){
  return(
  <div className="flex w-full justify-between px-10 py-5 border-r border-b">
    <div className="flex flex-col">
      <span className="text-sm font-semibold">{ title }</span>
      <span className="text-xs text-zinc-600">{ subtitle }</span>
    </div>
  </div>
  )
}