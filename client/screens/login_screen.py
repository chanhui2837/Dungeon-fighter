import pygame
from ..game_config import *

pygame.font.init()
FONT = pygame.font.Font(None, 36)
SMALL_FONT = pygame.font.Font(None, 28)
TITLE_FONT = pygame.font.Font(None, 64)


class LoginScreen:
    def __init__(self, screen, api):
        self.screen = screen
        self.api = api
        self.username = ""
        self.password = ""
        self.email = ""
        self.active_field = "username"
        self.message = ""
        self.message_color = RED
        self.show_password = False
        self.show_find = False
        self.find_email = ""
        self.find_message = ""
        self.find_color = RED
        self.find_step = "email"
        self.find_code = ""
        self.find_result = ""

    def draw_text(self, text, font, color, x, y, center=True):
        surf = font.render(text, True, color)
        rect = surf.get_rect()
        if center:
            rect.center = (x, y)
        else:
            rect.topleft = (x, y)
        self.screen.blit(surf, rect)

    def draw_input_box(self, x, y, w, h, text, active, show_text=True):
        color = BLUE if active else LIGHT_GRAY
        pygame.draw.rect(self.screen, DARK_GRAY, (x, y, w, h))
        pygame.draw.rect(self.screen, color, (x, y, w, h), 3)
        display = text if show_text else "*" * len(text)
        self.draw_text(display if display else " ", FONT, WHITE, x + 10, y + h // 2, center=False)

    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if self.show_find:
                if self.find_step == "email":
                    if event.key == pygame.K_BACKSPACE:
                        self.find_email = self.find_email[:-1]
                    elif event.key == pygame.K_RETURN:
                        self.try_find_account()
                    elif event.key == pygame.K_ESCAPE:
                        self.show_find = False
                    else:
                        if len(self.find_email) < 50:
                            self.find_email += event.unicode
                elif self.find_step == "code":
                    if event.key == pygame.K_BACKSPACE:
                        self.find_code = self.find_code[:-1]
                    elif event.key == pygame.K_RETURN:
                        self.try_verify_find()
                    elif event.key == pygame.K_ESCAPE:
                        self.find_step = "email"
                    else:
                        if len(self.find_code) < 6 and event.unicode.isdigit():
                            self.find_code += event.unicode
                return
            if event.key == pygame.K_TAB:
                fields = ["username", "password", "email"]
                idx = fields.index(self.active_field)
                self.active_field = fields[(idx + 1) % len(fields)]
            elif event.key == pygame.K_RETURN:
                if self.active_field == "password" and self.password:
                    self.try_login()
                elif self.active_field == "email":
                    self.try_register()
                else:
                    fields = ["username", "password", "email"]
                    idx = fields.index(self.active_field)
                    self.active_field = fields[(idx + 1) % len(fields)]
            elif event.key == pygame.K_BACKSPACE:
                if self.active_field == "username":
                    self.username = self.username[:-1]
                elif self.active_field == "password":
                    self.password = self.password[:-1]
                else:
                    self.email = self.email[:-1]
            else:
                if self.active_field == "username" and len(self.username) < 20:
                    self.username += event.unicode
                elif self.active_field == "password" and len(self.password) < 30:
                    self.password += event.unicode
                elif self.active_field == "email" and len(self.email) < 200:
                    self.email += event.unicode

        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos

            if self.show_find:
                if 100 <= mx <= 250 and 130 <= my <= 170:
                    self.show_find = False
                    self.find_step = "email"
                    self.find_code = ""
                    self.find_result = ""
                    return
                if self.find_step == "email":
                    if 362 <= mx <= 662 and 560 <= my <= 610:
                        self.try_find_account()
                    if 362 <= mx <= 662 and 320 <= my <= 380:
                        self.active_field = "find_email"
                elif self.find_step == "code":
                    if 362 <= mx <= 662 and 560 <= my <= 610:
                        self.try_verify_find()
                    if 362 <= mx <= 662 and 320 <= my <= 380:
                        self.active_field = "find_code"
                return

            if 100 <= mx <= 250 and 130 <= my <= 170:
                self.show_find = True
                self.find_message = ""
                return
            if 362 <= mx <= 662 and 580 <= my <= 630:
                self.try_login()
            elif 362 <= mx <= 662 and 650 <= my <= 700:
                self.try_register()
            elif 700 <= mx <= 800 and 530 <= my <= 550:
                self.show_password = not self.show_password
            if 362 <= mx <= 662 and 270 <= my <= 330:
                self.active_field = "username"
            elif 362 <= mx <= 662 and 370 <= my <= 430:
                self.active_field = "password"
            elif 362 <= mx <= 662 and 470 <= my <= 530:
                self.active_field = "email"

    def try_login(self):
        if not self.username or not self.password:
            self.message = "Fill in all fields"
            self.message_color = RED
            return
        success, err = self.api.login(self.username, self.password)
        if success:
            self.message = "Login successful!"
            self.message_color = GREEN
        else:
            self.message = err or "Login failed"
            self.message_color = RED

    def try_register(self):
        if not self.username or not self.password:
            self.message = "Fill in all fields"
            self.message_color = RED
            return
        if len(self.password) < 4:
            self.message = "Password must be 4+ characters"
            self.message_color = RED
            return
        success, err = self.api.register(self.username, self.password, self.email.strip() or None)
        if success:
            self.message = "Registration successful!"
            self.message_color = GREEN
        else:
            self.message = err or "Registration failed"
            self.message_color = RED

    def try_find_account(self):
        if not self.find_email:
            self.find_message = "Enter your email"
            self.find_color = RED
            return
        success, msg, err = self.api.find_account(self.find_email)
        if success:
            self.find_message = msg or "Code sent!"
            self.find_color = GREEN
            self.find_step = "code"
        else:
            self.find_message = err or "No account found"
            self.find_color = RED

    def try_verify_find(self):
        if not self.find_code or len(self.find_code) < 6:
            self.find_message = "Enter 6-digit code"
            self.find_color = RED
            return
        success, username, password = self.api.verify_find_account(self.find_email, self.find_code)
        if success:
            self.find_result = f"ID: {username}  New PW: {password}"
            self.find_message = "Copy before closing!"
            self.find_color = GREEN
            self.find_step = "done"
        else:
            self.find_message = "Invalid code"
            self.find_color = RED

    def draw(self):
        self.screen.fill(DARK_GRAY)

        title = "DUNGEON FIGHTER"
        self.draw_text(title, TITLE_FONT, GOLD, SCREEN_WIDTH // 2, 80)

        if self.show_find:
            self.draw_text("Find Account", FONT, WHITE, SCREEN_WIDTH // 2, 130)

            if self.find_step == "email":
                self.draw_text("Enter your registered email:", SMALL_FONT, WHITE, 362, 295, center=False)
                self.draw_input_box(362, 320, 300, 55, self.find_email, self.active_field == "find_email", True)
                pygame.draw.rect(self.screen, GREEN, (362, 560, 300, 50))
                self.draw_text("Send Code", FONT, BLACK, SCREEN_WIDTH // 2, 585)

            elif self.find_step == "code":
                self.draw_text("Verification code sent to your email", SMALL_FONT, GREEN, SCREEN_WIDTH // 2, 200)
                self.draw_text("Enter 6-digit code:", SMALL_FONT, WHITE, 362, 295, center=False)
                self.draw_input_box(362, 320, 300, 55, self.find_code, self.active_field == "find_code", True)
                pygame.draw.rect(self.screen, GREEN, (362, 560, 300, 50))
                self.draw_text("Verify Code", FONT, BLACK, SCREEN_WIDTH // 2, 585)
                self.draw_text("ESC to go back", SMALL_FONT, GRAY, SCREEN_WIDTH // 2, 425)

            elif self.find_step == "done":
                self.draw_text("Account Found!", SMALL_FONT, GREEN, SCREEN_WIDTH // 2, 230)
                self.draw_text(self.find_result, FONT, GREEN, SCREEN_WIDTH // 2, 340)

            if self.find_message:
                self.draw_text(self.find_message, SMALL_FONT, self.find_color, SCREEN_WIDTH // 2, 520)

            pygame.draw.rect(self.screen, GRAY, (100, 130, 150, 40), border_radius=5)
            self.draw_text("Back", SMALL_FONT, WHITE, 175, 150)
            self.draw_text("ESC to go back", SMALL_FONT, GRAY, SCREEN_WIDTH // 2, 690)
            return

        self.draw_text("Login", FONT, WHITE, SCREEN_WIDTH // 2, 160)

        self.draw_text("Username:", SMALL_FONT, WHITE, 362, 245, center=False)
        self.draw_input_box(362, 270, 300, 55, self.username, self.active_field == "username", True)

        self.draw_text("Password:", SMALL_FONT, WHITE, 362, 345, center=False)
        self.draw_input_box(362, 370, 300, 55, self.password, self.active_field == "password", self.show_password)

        toggle_text = "Hide" if self.show_password else "Show"
        self.draw_text(toggle_text, SMALL_FONT, GRAY, 700, 398)

        self.draw_text("Email:", FONT, WHITE, 362, 445, center=False)
        self.draw_input_box(362, 470, 300, 55, self.email, self.active_field == "email", True)

        pygame.draw.rect(self.screen, GREEN, (362, 580, 300, 50))
        self.draw_text("Login", FONT, BLACK, SCREEN_WIDTH // 2, 605)

        pygame.draw.rect(self.screen, BLUE, (362, 650, 300, 50))
        self.draw_text("Register", FONT, WHITE, SCREEN_WIDTH // 2, 675)

        pygame.draw.rect(self.screen, GRAY, (100, 130, 200, 40), border_radius=5)
        self.draw_text("Find Account", SMALL_FONT, WHITE, 200, 150)

        if self.message:
            self.draw_text(self.message, SMALL_FONT, self.message_color, SCREEN_WIDTH // 2, 550)

        status = "Server: Connected" if True else "Server: Disconnected"
        self.draw_text(status, SMALL_FONT, GREEN, SCREEN_WIDTH // 2, 730)
