import pygame
from ..game_config import *

pygame.font.init()
FONT = pygame.font.Font(None, 40)
BIG_FONT = pygame.font.Font(None, 48)
SMALL_FONT = pygame.font.Font(None, 28)
TITLE_FONT = pygame.font.Font(None, 56)


class GameModeScreen:
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

    def draw_button(self, x, y, w, h, text, color, text_color=WHITE, desc="", hover=False):
        c = (min(color[0] + 40, 255), min(color[1] + 40, 255), min(color[2] + 40, 255)) if hover else color
        pygame.draw.rect(self.screen, c, (x, y, w, h), border_radius=10)
        pygame.draw.rect(self.screen, WHITE, (x, y, w, h), 3, border_radius=10)
        self.draw_text(text, BIG_FONT, text_color, x + w // 2, y + h // 2 - 10)
        if desc:
            self.draw_text(desc, SMALL_FONT, LIGHT_GRAY, x + w // 2, y + h // 2 + 25)

    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                return "back"
        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if 50 <= mx <= 200 and 680 <= my <= 730:
                return "back"
            if 162 <= mx <= 462 and 300 <= my <= 420:
                return "single"
            if 562 <= mx <= 862 and 300 <= my <= 420:
                return "multi"
            if 312 <= mx <= 712 and 500 <= my <= 570:
                return "back"

    def draw(self):
        self.screen.fill(DARK_GRAY)

        self.draw_text("SELECT GAME MODE", TITLE_FONT, GOLD, SCREEN_WIDTH // 2, 100)

        mx, my = pygame.mouse.get_pos()

        self.draw_text("Choose your adventure!", FONT, WHITE, SCREEN_WIDTH // 2, 180)

        self.draw_button(162, 300, 300, 120, "Single Play", GREEN,
                        desc="Play alone, fight monsters!",
                        hover=(162 <= mx <= 462 and 300 <= my <= 420))

        self.draw_button(562, 300, 300, 120, "Multi Play", BLUE,
                        desc="Fight with friends!",
                        hover=(562 <= mx <= 862 and 300 <= my <= 420))

        if self.api.user_data:
            data = self.api.user_data
            self.draw_text(f"Lv.{data['level']} {data['username']}", SMALL_FONT, LIGHT_GRAY, SCREEN_WIDTH // 2, 470)

        back_hover = (312 <= mx <= 712 and 500 <= my <= 570)
        c = (GRAY[0]+30, GRAY[1]+30, GRAY[2]+30) if back_hover else GRAY
        pygame.draw.rect(self.screen, c, (312, 500, 400, 70), border_radius=8)
        pygame.draw.rect(self.screen, WHITE, (312, 500, 400, 70), 2, border_radius=8)
        self.draw_text("Back to Main", FONT, WHITE, SCREEN_WIDTH // 2, 535)

        self.draw_text("ESC: Back", SMALL_FONT, GRAY, 125, 660, center=False)
