export default function () {
  return {
    // Model of the data
    fileName: "posts",
    itemModel: {
      id: {
        hidden: true,
      },
      userId: {
        label: "User ID",
        inputType: "select", // HTML input types
        options: [1, 2, 3],
        required: true,
      },
      title: {
        label: "Title",
        inputType: "text",
        required: true,
      },
      body: {
        label: "Body",
        inputType: "textarea",
        required: true,
      },
    },
    items: [],
  };
}
