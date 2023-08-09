import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LoginAuthMessage, UserEntity } from '../Signum.Entities.Authorization'
import * as AuthClient from '../AuthClient'
import { LinkContainer } from '@framework/Components';
import { Dropdown, NavItem, NavDropdown, Nav } from 'react-bootstrap';
import { toLite } from '@framework/Signum.Entities';


export default function LoginDropdown(p: {
  renderName?: (u: UserEntity) => React.ReactChild;
  changePasswordVisible?: boolean;
  switchUserVisible?: boolean;
  profileVisible?: boolean;
  extraButons?: (user: UserEntity) => React.ReactNode;
}) {

  const user = AuthClient.currentUser();

  if (!user)
    return (
      <LinkContainer to="~/auth/login" className="sf-login">
        <Nav.Link>{LoginAuthMessage.Login.niceToString()}</Nav.Link>
      </LinkContainer>
    );

  const cpv = p.changePasswordVisible ?? true;
  const suv = p.switchUserVisible ?? true;
  const pv = p.profileVisible ?? true;


  function handleProfileClick() {
    import("@framework/Navigator")
      .then(Navigator =>
        Navigator.API.fetchEntityPack(toLite(user))
          .then(pack => Navigator.view(pack))
          .then(u => u && AuthClient.API.fetchCurrentUser(true).then(nu => AuthClient.setCurrentUser(u))))
      .done();
  }

  var extraButtons = p.extraButons && p.extraButons(user);

  return (
    <NavDropdown className="sf-login-dropdown" id="sfLoginDropdown" title={p.renderName ? p.renderName(user) : user.userName!} align="end">
      {pv && <NavDropdown.Item id="sf-auth-profile" onClick={handleProfileClick}><FontAwesomeIcon icon="user-edit" fixedWidth className="me-2" /> {LoginAuthMessage.MyProfile.niceToString()}</NavDropdown.Item>}
      {cpv && <LinkContainer to="~/auth/changePassword">
        <NavDropdown.Item><FontAwesomeIcon icon="key" fixedWidth className="me-2" /> {LoginAuthMessage.ChangePassword.niceToString()}</NavDropdown.Item>
      </LinkContainer>} 
      {extraButtons}
      {(cpv || pv || extraButtons) && <NavDropdown.Divider />}
      {suv && <LinkContainer to="~/auth/login"><NavDropdown.Item><FontAwesomeIcon icon="user-friends" className="me-2" /> {LoginAuthMessage.SwitchUser.niceToString()}</NavDropdown.Item></LinkContainer>}
      <NavDropdown.Item id="sf-auth-logout" onClick={() => AuthClient.logout()}><FontAwesomeIcon icon="sign-out-alt" fixedWidth className="me-2"/> {LoginAuthMessage.Logout.niceToString()}</NavDropdown.Item>
    </NavDropdown>
  );
}



