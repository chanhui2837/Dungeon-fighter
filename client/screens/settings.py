import pygame
from ..game_config import *

pygame.font.init()
FONT = pygame.font.Font(None, 40)
SMALL_FONT = pygame.font.Font(None, 30)
TITLE_FONT = pygame.font.Font(None, 50)


class SettingsScreen:
    def __init__(self, screen, api):
        self.screen = screen
        self.api = api
        self.music_volume = 0.5
        self.message = ""
        self.message_color = RED
        self.confirm_delete = False
        self.email_input = ""
        self.email_message = ""
        self.email_color = GREEN
        self.active_field = None
        self.pending_email = ""
        self.email_code = ""
        self.email_step = "input"
        self.load_settings()
        self.refresh_email()

    def load_settings(self):
        try:
            with open("settings.dat", "r") as f:
                self.music_volume = float(f.read().strip())
        except:
            self.music_volume = 0.5

    def refresh_email(self):
        if self.api.user_data:
            self.email_input = self.api.user_data.get("email") or ""
            self.email_message = ""
            self.email_step = "input"
            self.pending_email = ""
            self.email_code = ""

    def save_settings(self):
        try:
            with open("settings.dat", "w") as f:
                f.write(str(self.music_volume))
        except:
            pass

    def draw_text(self, text, font, color, x, y, center=True):
        surf = font.render(text, True, color)
        rect = surf.get_rect()
        if center:
            rect.center = (x, y)
        else:
            rect.topleft = (x, y)
        self.screen.blit(surf, rect)

    def try_save_email(self):
        email = self.email_input.strip()
        if not email:
            self.email_message = "Enter an email address"
            self.email_color = RED
            return
        success, err = self.api.send_verification(email, True)
        if success:
            self.pending_email = email
            self.email_message = "Code sent! Check email."
            self.email_color = GREEN
            self.email_step = "code"
        else:
            self.email_message = err or "Failed to send code"
            self.email_color = RED

    def try_verify_email(self):
        if not self.email_code or len(self.email_code) < 6:
            self.email_message = "Enter 6-digit code"
            self.email_color = RED
            return
        success, err = self.api.verify_email_code(self.pending_email, self.email_code)
        if success:
            self.email_message = "Email verified!"
            self.email_color = GREEN
            self.email_step = "input"
            self.pending_email = ""
            self.email_code = ""
            self.refresh_email()
        else:
            self.email_message = err or "Invalid code"
            self.email_color = RED

    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if self.active_field == "email":
                if event.key == pygame.K_BACKSPACE:
                    self.email_input = self.email_input[:-1]
                elif event.key == pygame.K_RETURN:
                    self.try_send_verification()
                else:
                    if len(self.email_input) < 200:
                        self.email_input += event.unicode
            elif self.active_field == "email_code":
                if event.key == pygame.K_BACKSPACE:
                    self.email_code = self.email_code[:-1]
                elif event.key == pygame.K_RETURN:
                    self.try_verify_email()
                else:
                    if len(self.email_code) < 6 and event.unicode.isdigit():
                        self.email_code += event.unicode

        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if 50 <= mx <= 200 and 680 <= my <= 730:
                return "back"
            if 312 <= mx <= 712 and 400 <= my <= 440:
                self.confirm_delete = not self.confirm_delete
            if self.confirm_delete:
                if 312 <= mx <= 462 and 500 <= my <= 550:
                    success, err = self.api.delete_account()
                    if success:
                        self.message = "Account deleted"
                        self.message_color = GREEN
                        return "deleted"
                    else:
                        self.message = err or "Delete failed"
                        self.message_color = RED
                    self.confirm_delete = False
                if 562 <= mx <= 712 and 500 <= my <= 550:
                    self.confirm_delete = False
            else:
                if 312 <= mx <= 712 and 480 <= my <= 530:
                    self.api.logout()
                    return "logout"
                if 312 <= mx <= 712 and 130 <= my <= 175:
                    self.active_field = "email"
                if 312 <= mx <= 712 and 200 <= my <= 245:
                    self.active_field = "email_code"
                if 650 <= mx <= 712 and 130 <= my <= 175:
                    self.try_send_verification()
                if 650 <= mx <= 712 and 200 <= my <= 245:
                    self.try_verify_email()

        if event.type == pygame.MOUSEMOTION and pygame.mouse.get_pressed()[0]:
            mx, my = event.pos
            if 312 <= mx <= 712 and 280 <= my <= 340:
                self.music_volume = (mx - 312) / 400
                self.music_volume = max(0.0, min(1.0, self.music_volume))
                self.save_settings()
                try:
                    pygame.mixer.music.set_volume(self.music_volume)
                except:
                    pass

    def draw(self):
        self.screen.fill(DARK_GRAY)

        self.draw_text("Settings", TITLE_FONT, WHITE, SCREEN_WIDTH // 2, 50)

        self.draw_text("Email", FONT, WHITE, 100, 120, center=False)
        email_color = BLUE if self.active_field == "email" else LIGHT_GRAY
        pygame.draw.rect(self.screen, DARK_GRAY, (312, 130, 400, 45))
        pygame.draw.rect(self.screen, email_color, (312, 130, 400, 45), 3)
        self.draw_text(self.email_input if self.email_input else "Enter email for recovery", SMALL_FONT, WHITE, 322, 152, center=False)

        save_hover = (650 <= mx <= 712 and 130 <= my <= 175) if 'mx' in dir() else False
        save_btn_color = (BLUE[0]+30, BLUE[1]+30, BLUE[2]+30) if save_hover else BLUE
        pygame.draw.rect(self.screen, save_btn_color, (650, 130, 80, 45), border_radius=5)
        self.draw_text("Send", SMALL_FONT, WHITE, 690, 152)

        if self.email_step == "code":
            code_color = BLUE if self.active_field == "email_code" else LIGHT_GRAY
            pygame.draw.rect(self.screen, DARK_GRAY, (312, 200, 400, 45))
            pygame.draw.rect(self.screen, code_color, (312, 200, 400, 45), 3)
            self.draw_text(self.email_code if self.email_code else "6-digit code", SMALL_FONT, WHITE, 322, 222, center=False)

            ver_hover = (650 <= mx <= 712 and 200 <= my <= 245) if 'mx' in dir() else False
            ver_btn_color = (GREEN[0]+30, GREEN[1]+30, GREEN[2]+30) if ver_hover else GREEN
            pygame.draw.rect(self.screen, ver_btn_color, (650, 200, 80, 45), border_radius=5)
            self.draw_text("Verify", SMALL_FONT, WHITE, 690, 222)

        if self.email_message:
            self.draw_text(self.email_message, SMALL_FONT, self.email_color, SCREEN_WIDTH // 2, 185)

        if self.api.user_data:
            email_display = self.api.user_data.get("email") or "No email set"
            email_display_color = GREEN if self.api.user_data.get("email") else RED
            self.draw_text(f"Current: {email_display}", SMALL_FONT, email_display_color, SCREEN_WIDTH // 2, 210)

        self.draw_text("Music Volume", FONT, WHITE, SCREEN_WIDTH // 2, 250)

        slider_x, slider_y, slider_w, slider_h = 312, 310, 400, 30
        pygame.draw.rect(self.screen, DARK_GRAY, (slider_x, slider_y, slider_w, slider_h))
        pygame.draw.rect(self.screen, WHITE, (slider_x, slider_y, slider_w, slider_h), 2)

        fill_w = int(slider_w * self.music_volume)
        pygame.draw.rect(self.screen, BLUE, (slider_x, slider_y, fill_w, slider_h))

        knob_x = slider_x + fill_w
        pygame.draw.circle(self.screen, WHITE, (knob_x, slider_y + slider_h // 2), 12)
        pygame.draw.circle(self.screen, BLACK, (knob_x, slider_y + slider_h // 2), 12, 2)

        vol_text = f"{int(self.music_volume * 100)}%"
        self.draw_text(vol_text, FONT, GOLD, SCREEN_WIDTH // 2, 380)

        self.draw_text("Account", FONT, WHITE, SCREEN_WIDTH // 2, 440)

        user_info = f"Logged in as: {self.api.user_data['username'] if self.api.user_data else 'N/A'}"
        self.draw_text(user_info, SMALL_FONT, LIGHT_GRAY, SCREEN_WIDTH // 2, 470)

        delete_color = RED if not self.confirm_delete else DARK_GRAY
        pygame.draw.rect(self.screen, delete_color, (312, 400, 400, 40), border_radius=5)
        pygame.draw.rect(self.screen, RED, (312, 400, 400, 40), 2, border_radius=5)
        self.draw_text("Delete Account", FONT, WHITE, SCREEN_WIDTH // 2, 420)

        if self.confirm_delete:
            self.draw_text("Are you sure?", SMALL_FONT, RED, SCREEN_WIDTH // 2, 485)
            pygame.draw.rect(self.screen, RED, (312, 500, 150, 50), border_radius=5)
            self.draw_text("Yes", FONT, WHITE, 387, 525)
            pygame.draw.rect(self.screen, GRAY, (562, 500, 150, 50), border_radius=5)
            self.draw_text("No", FONT, WHITE, 637, 525)
        else:
            pygame.draw.rect(self.screen, ORANGE, (312, 480, 400, 50), border_radius=5)
            self.draw_text("Logout", FONT, WHITE, SCREEN_WIDTH // 2, 505)

        if self.message:
            self.draw_text(self.message, SMALL_FONT, self.message_color, SCREEN_WIDTH // 2, 570)

        pygame.draw.rect(self.screen, GRAY, (50, 680, 150, 50), border_radius=5)
        self.draw_text("Back", FONT, WHITE, 125, 705)
