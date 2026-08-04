import requests
import json

SERVER_URL = "http://127.0.0.1:5000"


class GameAPI:
    def __init__(self):
        self.session = requests.Session()
        self.user_data = None

    def register(self, username, password, email=None):
        try:
            body = {"username": username, "password": password}
            if email:
                body["email"] = email
            resp = self.session.post(
                f"{SERVER_URL}/api/register",
                json=body,
                timeout=5
            )
            if resp.status_code == 201:
                self.user_data = resp.json()
                return True, None
            return False, resp.json().get("error", "Registration failed")
        except requests.exceptions.ConnectionError:
            return False, "Cannot connect to server"
        except Exception as e:
            return False, str(e)

    def login(self, username, password):
        try:
            resp = self.session.post(
                f"{SERVER_URL}/api/login",
                json={"username": username, "password": password},
                timeout=5
            )
            if resp.status_code == 200:
                self.user_data = resp.json()
                return True, None
            return False, resp.json().get("error", "Login failed")
        except requests.exceptions.ConnectionError:
            return False, "Cannot connect to server"
        except Exception as e:
            return False, str(e)

    def logout(self):
        try:
            self.session.post(f"{SERVER_URL}/api/logout", timeout=5)
        except:
            pass
        self.user_data = None

    def get_user(self):
        try:
            resp = self.session.get(f"{SERVER_URL}/api/user", timeout=5)
            if resp.status_code == 200:
                self.user_data = resp.json()
                return True
            return False
        except:
            return False

    def update_user(self, data):
        try:
            resp = self.session.put(
                f"{SERVER_URL}/api/user/update",
                json=data,
                timeout=5
            )
            if resp.status_code == 200:
                self.user_data = resp.json()
                return True
            return False
        except:
            return False

    def delete_account(self):
        try:
            resp = self.session.delete(
                f"{SERVER_URL}/api/user/delete",
                timeout=5
            )
            if resp.status_code == 200:
                self.user_data = None
                return True, None
            return False, resp.json().get("error", "Delete failed")
        except Exception as e:
            return False, str(e)

    def find_account(self, email):
        try:
            resp = self.session.post(
                f"{SERVER_URL}/api/find-account",
                json={"email": email},
                timeout=5
            )
            if resp.status_code == 200:
                return True, resp.json().get("message"), None
            return False, None, resp.json().get("error", "No account found")
        except requests.exceptions.ConnectionError:
            return False, None, "Cannot connect to server"
        except Exception as e:
            return False, None, str(e)

    def verify_find_account(self, email, code):
        try:
            resp = self.session.post(
                f"{SERVER_URL}/api/verify-find-account",
                json={"email": email, "code": code},
                timeout=5
            )
            if resp.status_code == 200:
                data = resp.json()
                return True, data.get("username"), data.get("new_password")
            return False, None, None
        except Exception as e:
            return False, None, None

    def send_verification(self, email, exclude_self=False):
        try:
            resp = self.session.post(
                f"{SERVER_URL}/api/send-verification",
                json={"email": email, "exclude_self": exclude_self},
                timeout=5
            )
            if resp.status_code == 200:
                return True, None
            return False, resp.json().get("error", "Failed to send code")
        except requests.exceptions.ConnectionError:
            return False, "Cannot connect to server"
        except Exception as e:
            return False, str(e)

    def verify_email_code(self, email, code):
        try:
            resp = self.session.post(
                f"{SERVER_URL}/api/verify-email-link",
                json={"email": email, "code": code},
                timeout=5
            )
            if resp.status_code == 200:
                self.user_data = resp.json()
                return True, None
            return False, resp.json().get("error", "Invalid code")
        except requests.exceptions.ConnectionError:
            return False, "Cannot connect to server"
        except Exception as e:
            return False, str(e)

    def is_logged_in(self):
        return self.user_data is not None
