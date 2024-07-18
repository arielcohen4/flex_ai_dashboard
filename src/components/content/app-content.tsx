"use client"
import { useState } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { IconAdjustmentsHorizontal, IconSortAscendingLetters, IconSortDescendingLetters } from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useQuery } from "@tanstack/react-query";
import { Database, Tables, Enums } from "@/lib/types/supabase";
import { Badge } from "@/components/ui/badge";
import { roundToK } from "@/lib/utils";

const appText = new Map<string, string>([
  ['all', 'Family'],
  ['qwen2', 'phi3'],
  ['qwen2', 'phi3'],
])

export default function AppContent() {
  const [sort, setSort] = useState('ascending')
  const [appType, setAppType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const modelsQuery = useQuery({
		queryKey: ["models"],
		queryFn: async () => {
			const supabase = supabaseBrowser();
			const { data } = await supabase.auth.getSession();
			if (data.session?.user) {

				const { data, error } = await supabase.from('models').select('*')

				return data;
			}
		}
  });

  if (!modelsQuery.data) {
    return <div>Loading...</div>
  }

  const filteredApps = modelsQuery.data
    .sort((a, b) =>
      sort === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .filter((app) =>
      appType == "all" || appType === app.family
    )
    .filter((app) => app.name.toLowerCase().includes(searchTerm.toLowerCase()))
	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-6">
			<div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Models Hub
          </h1>
          <p className='text-muted-foreground'>
            Select the open source LLM you want to train
          </p>
        </div>
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <Input
              placeholder='Filter apps...'
              className='h-9 w-40 lg:w-[250px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={appType} onValueChange={setAppType}>
              <SelectTrigger className='w-36'>
                <SelectValue>{appText.get(appType)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Family</SelectItem>
                <SelectItem value='gemma2'>gemma2</SelectItem>
                <SelectItem value='qwen2'>qwen2</SelectItem>
                <SelectItem value='llama3'>llama3</SelectItem>
                <SelectItem value='tinyllama'>tinyllama</SelectItem>
                <SelectItem value='mixtral'>mixtral</SelectItem>
                <SelectItem value='deepseek-coder-v2'>deepseek-coder-v2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className='w-16'>
              <SelectValue>
                <IconAdjustmentsHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value='ascending'>
                <div className='flex items-center gap-4'>
                  <IconSortAscendingLetters size={16} />
                  <span>Ascending</span>
                </div>
              </SelectItem>
              <SelectItem value='descending'>
                <div className='flex items-center gap-4'>
                  <IconSortDescendingLetters size={16} />
                  <span>Descending</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className='shadow' />
        <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredApps.map((app) => (
            <li
              key={app.name}
              className='rounded-lg border p-4 hover:shadow-md'
            >
              <div className='mb-8 flex items-center justify-between'>
                <div
                  className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}
                >
                 {null}
                </div>
                <Badge variant="secondary">{roundToK(app.context_length)} context size</Badge>
                <Badge variant="secondary">{roundToK(app.params_count)}b params</Badge>
                <Button
                  variant='outline'
                  size='sm'
                >
                  View Code
                </Button>
              </div>
              <div>
                <a href={`https://huggingface.co/${app.name}`} target="_blank" className='mb-1 font-semibold'>{app.name}</a>
                <p className='line-clamp-2 text-gray-500'>{"desc"}</p>
              </div>
            </li>
          ))}
        </ul>
		</div>
	);
}
