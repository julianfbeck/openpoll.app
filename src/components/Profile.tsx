import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { Poll } from '@/models/types';

import { Tooltip } from './ui/tooltip';
import { Button } from './ui/button';

export function UserProfile({ polls }: { polls: Poll[] }) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Poll Question</TableHead>
            <TableHead>Creation Date</TableHead>
            <TableHead>Number of Options</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Views</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {polls.map((poll) => (
            <TableRow key={poll.id}>
              <TableCell>
                <a href={`/poll/${poll.shortId}`}>{poll.question}</a>
              </TableCell>
              <TableCell>{poll.timestamp}</TableCell>
              <TableCell>{poll.options.length}</TableCell>
              <TableCell>
                {poll.options.reduce((acc, curr) => acc + curr.votes, 0)}
              </TableCell>
              <TableCell>{poll.views}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total Polls</TableCell>
            <TableCell>{polls.length}</TableCell>
            <TableCell></TableCell> {/* Empty cell for alignment */}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
