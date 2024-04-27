import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { Poll } from '@/models/types';

export function PollsTable({ polls }: { polls: Poll[] }) {
  function formatDate(dateStr: string) {
    const local = import.meta.env.SSR ? 'en-US' : navigator.language;
    const date = new Date(dateStr);
    return date.toLocaleDateString(local, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
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
            <TableRow
              key={poll.id}
              style={{ cursor: 'pointer' }}
              onClick={() => (window.location.href = `/poll/${poll.shortId}`)}
            >
              <TableCell>
                <a
                  href={`/poll/${poll.shortId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {poll.question}
                </a>
              </TableCell>
              <TableCell>{formatDate(poll.timestamp)}</TableCell>
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
