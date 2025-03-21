import * as React from "react";
import { RouteObject } from 'react-router'
import { Link } from 'react-router-dom'
import { ImportComponent } from '@framework/ImportComponent'
import { ajaxPost } from "@framework/Services";
import { LoginAuthMessage } from "../Signum.Authorization/Signum.Authorization";
import LoginPage from "../Signum.Authorization/Login/LoginPage";
import * as AuthClient from "../Signum.Authorization/AuthClient";
import { registerChangeLogModule } from "@framework/Basics/ChangeLogClient";

export function startPublic(options: { routes: RouteObject[] }) {

  registerChangeLogModule("Signum.ResetPassword", () => import("./Changelog"));

  options.routes.push({ path: "/auth/forgotPasswordEmail", element: <ImportComponent onImport={() => import("./ForgotPasswordEmailPage")} /> });
  options.routes.push({ path: "/auth/resetPassword", element: <ImportComponent onImport={() => import("./ResetPassword")} /> });

  LoginPage.resetPasswordControl = () => <span>
    &nbsp;
    &nbsp;
    <Link to="/auth/forgotPasswordEmail">{LoginAuthMessage.IHaveForgottenMyPassword.niceToString()}</Link>
  </span>;
}

export module API {

  export function forgotPasswordEmail(request: ForgotPasswordEmailRequest): Promise<string> {
    return ajaxPost({ url: "/api/auth/forgotPasswordEmail" }, request);
  }

  export function resetPassword(request: ResetPasswordRequest): Promise<AuthClient.API.LoginResponse > {
    return ajaxPost({ url: "/api/auth/resetPassword" }, request);
  }

export interface ResetPasswordRequest {
  code: string;
  newPassword: string;
}

export interface ForgotPasswordEmailRequest {
  email: string;
}

}
