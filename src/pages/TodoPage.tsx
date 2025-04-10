import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { getUrl } from "aws-amplify/storage";

const client = generateClient<Schema>();

function TodoPage() {
  // All todos from database
  const [todos, setTodos] = useState<
    Array<Schema["Todo"]["type"] & { profilePicUrl?: string }>
  >([]);

  // Current signed-in user's sub (if any)
  const [user, setUser] = useState<{ sub: string } | null>(null);

  // STEP 1: Get current user info (sub) if signed in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;
        if (payload && payload["sub"]) {
          setUser({ sub: payload["sub"] });
        }
      } catch (err) {
        console.log("Guest user:", err);
        setUser(null); // Not signed in
      }
    };
    loadUser();
  }, []);

  // STEP 2: Fetch todos and attach profile picture for each
  async function fetchTodosWithProfilePics() {
    const todoResult = await client.models.Todo.list();

    const itemsWithPics = await Promise.all(
      todoResult.data.map(async (todo) => {
        let profilePicUrl: string | undefined;

        // If the todo has an owner (sub), try to get their profile pic
        if (todo.owner) {
          const fileName = `profile-pics/${todo.owner}_profile_pic`;
          try {
            const { url } = await getUrl({ key: fileName });
            profilePicUrl = url.toString();
          } catch (err) {
            // No profile pic found for this user
          }
        }

        return { ...todo, profilePicUrl };
      })
    );

    setTodos(itemsWithPics);
  }

  // STEP 3: Observe todos
  useEffect(() => {
    fetchTodosWithProfilePics();

    const subscription = client.models.Todo.observeQuery().subscribe({
      next: () => fetchTodosWithProfilePics(),
    });

    return () => subscription.unsubscribe();
  }, []);

  // STEP 4: Delete todo
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // STEP 5: Create todo
  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      const todoData: { content: string; owner?: string } = { content };
      if (user) {
        todoData.owner = user.sub;
      }
      client.models.Todo.create(todoData);
    }
  }

  // STEP 6: Render todos
  return (
    <main>
      <h1>My Todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => {
          const isUserTodo = user?.sub === todo.owner;

          return (
            <li
              key={todo.id}
              onClick={() => deleteTodo(todo.id)}
              style={{
                backgroundColor: isUserTodo ? "#b3e5fc" : "#f0f0f0",
                display: "flex",
                alignItems: "center",
                padding: "5px",
              }}
            >
              {todo.profilePicUrl && (
                <img
                  src={todo.profilePicUrl}
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