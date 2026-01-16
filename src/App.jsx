import { useState } from "react";
import axios from "axios";
import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  const handInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      //發送登入請求
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);

      const { token, expired } = response.data;

      //儲存token到cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;

      //設定axios預設header
      axios.defaults.headers.common.Authorization = token;

      //載入產品資料
      getData();

      //更新登入狀態
      setIsAuth(true);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  const checkLogin = async () => {
    try {
      const token = document.cookie
        .split(";")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];

      //設定axios預設header
      axios.defaults.headers.common.Authorization = token;

      const response = await axios.post(`${API_BASE}/api/user/check`);
      // console.log(response.data);
      alert("目前處於登入狀態");
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  const getData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      // console.log(response.data);
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handInputChange(e)}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <button
            className="btn btn-danger mb-5 mt-3"
            type="button"
            onClick={() => checkLogin()}
          >
            確認是否登入
          </button>
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.title}</td>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled ? `啟用` : `未啟用`}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => setTempProduct(product)}
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) => (
                        <img key={index} src={url} className="images" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
