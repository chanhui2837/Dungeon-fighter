import pygame
from ..game_config import *
from .avatar_draw import draw_character

pygame.font.init()
FONT = pygame.font.Font(None, 40)
SMALL_FONT = pygame.font.Font(None, 28)
TITLE_FONT = pygame.font.Font(None, 60)
BIG_FONT = pygame.font.Font(None, 72)


class MainMenu:
    def __init__(self, screen, api):
        self.screen = screen
        self.api = api

    def draw_text(self, text, font, color, x, y, center=True):
        surf = font.render(text, True, color)
        rect = surf.get_rect()
        if center:
            rect.center = (x, y)
        else:
            rect.topleft = (x, y)
        self.screen.blit(surf, rect)

    def draw_button(self, x, y, w, h, text, color, text_color=WHITE, hover=False):
        c = (min(color[0] + 30, 255), min(color[1] + 30, 255), min(color[2] + 30, 255)) if hover else color
        pygame.draw.rect(self.screen, c, (x, y, w, h), border_radius=8)
        pygame.draw.rect(self.screen, WHITE, (x, y, w, h), 2, border_radius=8)
        self.draw_text(text, FONT, text_color, x + w // 2, y + h // 2)

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if 312 <= mx <= 712:
                if 300 <= my <= 360:
                    return "game_mode"
                if 380 <= my <= 440:
                    return "avatar"
                if 460 <= my <= 520:
                    return "settings"
                if 540 <= my <= 600:
                    print("Store - coming soon!")
            if 850 <= mx <= 1000 and 700 <= my <= 750:
                return "logout"

    def draw(self):
        self.screen.fill(DARK_GRAY)

        self.draw_text("DUNGEON FIGHTER", TITLE_FONT, GOLD, SCREEN_WIDTH // 2, 60)

        if self.api.user_data:
            data = self.api.user_data
            name_text = f"{data['username']}"
            self.draw_text(name_text, BIG_FONT, WHITE, SCREEN_WIDTH // 2, 140)

            lv_color = CYAN
            self.draw_text(f"Lv.{data['level']}", FONT, lv_color, SCREEN_WIDTH // 2, 185)

            self.draw_text(f"Coins: {data['coins']}", FONT, GOLD, SCREEN_WIDTH // 2, 220)

            char = data.get("character", {})
            draw_character(self.screen, SCREEN_WIDTH // 2 - 150, 380, scale=1.5,
                          hat_id=char.get("hat"), clothes_id=char.get("clothes"),
                          hat_color=char.get("hat_color"), clothes_color=char.get("clothes_color"))

        mx, my = pygame.mouse.get_pos()
        btn_x, btn_w = 312, 400

        self.draw_button(btn_x, 300, btn_w, 60, "Game Start", GREEN, hover=(btn_x <= mx <= btn_x + btn_w and 300 <= my <= 360))
        self.draw_button(btn_x, 380, btn_w, 60, "Avatar", BLUE, hover=(btn_x <= mx <= btn_x + btn_w and 380 <= my <= 440))
        self.draw_button(btn_x, 460, btn_w, 60, "Settings", PURPLE, hover=(btn_x <= mx <= btn_x + btn_w and 460 <= my <= 520))
        self.draw_button(btn_x, 540, btn_w, 60, "Store", GOLD, hover=(btn_x <= mx <= btn_x + btn_w and 540 <= my <= 600))

        self.draw_text(f"Player: {self.api.user_data['username'] if self.api.user_data else 'Offline'}", SMALL_FONT, LIGHT_GRAY, 120, 740, center=False)

        logout_rect = pygame.Rect(850, 700, 150, 50)
        logout_c = (RED[0]+30, RED[1], RED[2]) if (850 <= mx <= 1000 and 700 <= my <= 750) else RED
        pygame.draw.rect(self.screen, logout_c, logout_rect, border_radius=5)
        pygame.draw.rect(self.screen, WHITE, logout_rect, 2, border_radius=5)
        self.draw_text("Logout", SMALL_FONT, WHITE, 925, 725)

    def get_result(self):
        return None
