import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { getUrl } from "aws-amplify/storage";

const client = generateClient<Schema>();

function TodoPage() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [user, setUser] = useState<{ sub: string; profilePicUrl?: string } | null>(null);

  // Fetch signed-in user’s info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;
        if (payload && payload["sub"]) {
          const sub = payload["sub"] as string;
          const fileName = `profile-pics/${sub}_profile_pic`;
          try {
            const { url } = await getUrl({ key: fileName });
            setUser({ sub, profilePicUrl: url.toString() });
          } catch (err) {
            setUser({ sub }); // No pic yet
          }
        }
      } catch (err) {
        console.log("No signed-in user:", err);
        setUser(null); // Guest
      }
    };
    loadUser();
  }, []);

  // Fetch todos
  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content }); // Owner auto-set by Amplify
    }
  }

  return (
    <main>
      <h1>My Todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => {
          const isUserTodo = user && todo.owner === user.sub;
          return (
            <li
              key={todo.id}
              onClick={() => deleteTodo(todo.id)}
              style={{
                backgroundColor: isUserTodo ? "#b3e5fc" : "#b3e5fc",
                display: "flex",
                alignItems: "center",
                padding: "5px",
              }}
            >
              {isUserTodo && user?.profilePicUrl && (
                <img
                  src={user.profilePicUrl}
                  alt="Profile"
                  style={{
                    width: "30px",
                    height: "30px",
                    marginRight: "10px",
                    borderRadius: "50%",
                  }}
                />
              )}
              {todo.content}
            </li>
          );
        })}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default TodoPage;