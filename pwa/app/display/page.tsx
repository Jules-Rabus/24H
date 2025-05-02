import { getUser } from '@/api/display';

export default async function DisplayPage() {
  const user = await getUser('1');
  console.log(user);
}
