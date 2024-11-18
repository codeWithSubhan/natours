import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: "POST",
      url: "http://localhost:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    console.log("res:", res);
    if (res.data.status == "success") {
      showAlert("success", "Logged in successuflly!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    console.log("err:", err.response.data.message);
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://localhost:3000/api/v1/users/logout",
    });
    if (res.data.status == "success") location.reload();

    console.log("res:", res);
  } catch (err) {
    showAlert("error", "Error logging out! Try again.");
    console.log("err:", err.response.data.message);
  }
};
