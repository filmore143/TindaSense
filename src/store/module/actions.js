export async function getById(context, payload) {
  return await context.dispatch(
    "helpers/request",
    {
      url: `${process.env.API_HOST}/${context.state.fileName}/${payload.id}`,
      method: "get",
      // headers: {},
      handler: (data) => {
        // Response data can be modified here before setting it to the store
        context.commit("set", data);
      },
    },
    { root: true }
  );
}

export async function get(context, query = {}) {
  const queryStr = await context.dispatch("helpers/queryToStr", query, {
    root: true,
  });

  return await context.dispatch(
    "helpers/request",
    {
      url: `${process.env.API_HOST}/${context.state.fileName}${queryStr}`,
      method: "get",
      // headers: {},
      handler: (data) => {
        // Response data can be modified here before setting it to the store
        context.commit("set", data);
      },
    },
    { root: true }
  );
}

export async function post(context, payload) {
  return await context.dispatch(
    "helpers/request",
    {
      url: `${process.env.API_HOST}/${context.state.fileName}`,
      method: "post",
      // headers: {},
      data: payload,
      handler: (data) => {
        // Response data can be modified here before adding it to the store
        context.commit("add", data);
      },
    },
    { root: true }
  );
}

export async function put(context, payload) {
  return await context.dispatch(
    "helpers/request",
    {
      url: `${process.env.API_HOST}/${context.state.fileName}/${payload.id}`,
      method: "put",
      // headers: {},
      data: payload,
      handler: (data) => {
        // Response data can be modified here before updating it from the store
        context.commit("update", data);
      },
    },
    { root: true }
  );
}

export async function del(context, payload) {
  return await context.dispatch(
    "helpers/request",
    {
      url: `${process.env.API_HOST}/${context.state.fileName}/${payload.id}`,
      method: "delete",
      // headers: {},
      handler: () => context.commit("remove", payload),
    },
    { root: true }
  );
}
