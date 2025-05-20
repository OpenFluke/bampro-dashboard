import React from "react";

export default class AdminKey extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      error: false,
      isModalOpen: false,
    };
  }

  /* ---------- Handle Modal Toggle ---------- */
  toggleModal = () => {
    this.setState((prevState) => ({
      isModalOpen: !prevState.isModalOpen,
      password: "",
      error: false,
    }));
  };

  /* ---------- Handle Password Input ---------- */
  handleChange = (e) => {
    this.setState({ password: e.target.value, error: false });
  };

  /* ---------- Handle Login Submission ---------- */
  handleSubmit = (e) => {
    e.preventDefault();
    const { onLogin } = this.props;
    const success = onLogin(this.state.password);
    if (success) {
      this.toggleModal();
    } else {
      this.setState({ error: true });
    }
  };

  render() {
    const { isAdmin, onLogout } = this.props;
    const { password, error, isModalOpen } = this.state;

    return (
      <div>
        {/* Show Admin Status with Logout Button or Unlock Button */}
        {isAdmin ? (
          <div className="notification is-success has-text-centered">
            <span>Admin access granted</span>
            <button
              className="button is-danger is-small ml-3"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button className="button is-warning" onClick={this.toggleModal}>
            Unlock Admin Access
          </button>
        )}

        {/* Modal for Password Input */}
        <div className={`modal ${isModalOpen ? "is-active" : ""}`}>
          <div className="modal-background" onClick={this.toggleModal}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Admin Login</p>
              <button
                className="delete"
                aria-label="close"
                onClick={this.toggleModal}
              ></button>
            </header>
            <section className="modal-card-body">
              <form onSubmit={this.handleSubmit}>
                <div className="field">
                  <label className="label">Admin Password</label>
                  <div className="control">
                    <input
                      className={`input ${error ? "is-danger" : ""}`}
                      type="password"
                      value={password}
                      onChange={this.handleChange}
                      placeholder="Enter admin password"
                    />
                  </div>
                  {error && (
                    <p className="help is-danger">
                      Incorrect password, please try again.
                    </p>
                  )}
                </div>
              </form>
            </section>
            <footer className="modal-card-foot">
              <button className="button is-primary" onClick={this.handleSubmit}>
                Login
              </button>
              <button className="button" onClick={this.toggleModal}>
                Cancel
              </button>
            </footer>
          </div>
        </div>
      </div>
    );
  }
}
