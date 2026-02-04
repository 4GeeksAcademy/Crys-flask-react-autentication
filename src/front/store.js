// estado inicial y reducer (estudiante, comentado para aprender)
export const initialStore = () => {
  return {
    message: null,
    todos: [
      { id: 1, title: "Make the bed", background: null },
      { id: 2, title: "Do my homework", background: null }
    ],
    // token y user_id manejados por sessionStorage para persistencia entre reloads
    token: (typeof window !== "undefined" && sessionStorage.getItem("token")) || null,
    user_id: (typeof window !== "undefined" && sessionStorage.getItem("user_id")) || null
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return { ...store, message: action.payload };

    case "add_task": {
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        )
      };
    }

    // login guarda token en el store y en sessionStorage
    case "login": {
      const { token, user_id } = action.payload;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user_id", String(user_id));
      }
      return { ...store, token, user_id };
    }

    // logout limpia token store y sessionStorage
    case "logout": {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user_id");
      }
      return { ...store, token: null, user_id: null };
    }

    default:
      throw Error("Unknown action.");
  }
}
