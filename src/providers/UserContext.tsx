import { createContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-hot-toast";

import { ApiRequests } from "../services";

import {
  IChildren,
  IUserContext,
} from "../interfaces/Context/contexts.interface";
import {
  IUserForgotPassword,
  IUserLogin,
  IUserLoginInfo,
  IUserRegister,
  IUserResponse,
  IUserUpdate,
} from "../interfaces/userSchema.interface";
import { IAdResponse } from "../interfaces/adSchema.interface";

export const UserContext = createContext({} as IUserContext);

export const UserProvider = ({ children }: IChildren) => {
  const [user, setUser] = useState<IUserResponse | null>(null);

  const [forgotPassword, setForgotPassword] = useState(false);

  const [showEditUser, setShowEditUser] = useState(false);

  const [showEditAddress, setShowEditAddress] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  const [userLoginAdminInfo, setUserLoginAdminInfo] =
    useState<IUserLoginInfo | null>(null);

  const [announcements, setAnnouncements] = useState<IAdResponse[] | null>(
    null
  );

  const [actualPage, setActualPage] = useState(1);

  const navigate = useNavigate();

  const userRegister = async (data: IUserRegister) => {
    try {
      await ApiRequests.post("/users", data);
      navigate("/login");
      toast.success("Cadastro realizado com sucesso.");
    } catch (error) {
      console.log(error);
      toast.error("E-mail já cadastrado");
    }
  };

  const userLogin = async (data: IUserLogin) => {
    try {
      const user = await ApiRequests.post("/sessions", data);
      localStorage.setItem("@motors:token", user.data.token);
      ApiRequests.defaults.headers.authorization = `Bearer ${user.data.token}`;
      const userLoginInformation: any = await ApiRequests.get(
        `/users/own/profile`
      );
      setUserLoginAdminInfo(userLoginInformation.data);

      if (userLoginInformation.data.isBuyer === false) {
        const userAnnouncements: any = await ApiRequests.get(
          `/announcements/user/specif/?page=${actualPage}`
        );
        setAnnouncements(userAnnouncements.data.data);
        // navigate("/dashboard");
      } else {
        const allAnnouncements: any = await ApiRequests.get(
          `/announcements/?page=${actualPage}`
        );
        setAnnouncements(allAnnouncements.data.data);
      }
      navigate("/dashboard");
      toast.success("Login realizado com sucesso.");
    } catch (error) {
      console.log(error);
      toast.error("Email e/ou senha são inválidos");
    }
  };

  const updateUser = async (data: IUserUpdate) => {
    console.log(data);
    try {
      const token = localStorage.getItem("@motors:token");

      const response = await ApiRequests.patch(
        `/users/${userLoginAdminInfo?.id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);

      if (data.address) {
        toast.success("Endereço editado com sucesso.");
      } else {
        toast.success("Perfil editado com sucesso.");
      }
      setShowEditUser(false);
      setShowEditAddress(false);
    } catch (error) {
      console.log(error);
      if (data.address) {
        toast.error("Endereço não pôde ser editado");
      } else {
        toast.error("Perfil não pôde ser editado");
      }
    }
  };

  const deleteUser = async () => {
    try {
      const token = localStorage.getItem("@motors:token");

      const response = await ApiRequests.delete(
        `/users/${userLoginAdminInfo?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      navigate("/");
      toast.success("Perfil excluído com sucesso.");
    } catch (error) {
      console.log(error);
      toast.error("Perfil não pôde ser excluído");
    }
  };

  const userLogout = () => {
    setUser(null);
    setShowDropdown(false);
    localStorage.removeItem("@motors:token");
    localStorage.removeItem("@motors:id");
    toast("Desconectado com sucesso!");
    navigate("/");
  };

  const userSendEmail = async (data: IUserForgotPassword) => {
    try {
      await ApiRequests.post("/users/reset-password", data);
      setLoading(true);
      toast.success("Email enviado com sucesso.");
    } catch (error) {
      console.log(error);
      toast.error("E-mail não pôde ser enviado");
    } finally {
      setLoading(false);
      setForgotPassword(false);
      navigate("/login");
    }
  };

  const userChangePassword = async (data: IUserUpdate) => {
    try {
      await ApiRequests.post(`/users/reset-password/${user?.resetToken}`, data);
      toast.success("Senha foi alterada com sucesso.");
    } catch (error) {
      console.log(error);
      toast.error("Senha não pôde ser alterada");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        navigate,
        userLogin,
        userRegister,
        updateUser,
        deleteUser,
        userLogout,
        userSendEmail,
        userChangePassword,
        forgotPassword,
        setForgotPassword,
        showEditUser,
        setShowEditUser,
        showEditAddress,
        setShowEditAddress,
        showDropdown,
        setShowDropdown,
        loading,
        setLoading,
        userLoginAdminInfo,
        setUserLoginAdminInfo,
        announcements,
        setAnnouncements,
        actualPage,
        setActualPage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
