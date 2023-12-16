function status(request, response) {
  response.status(200).json({ message: "It's working" });
}

export default status;
