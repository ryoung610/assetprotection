/**
import { useEffect, useState } from 'react';
import { Task } from '@/models'; // adjust import path if needed
import { DataStore } from '@aws-amplify/datastore';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await DataStore.query(Task);
        setTasks(result);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    const subscription = DataStore.observe(Task).subscribe(fetchTasks);
    return () => subscription.unsubscribe();
  }, []);

  return { tasks, loading };
}
   */
