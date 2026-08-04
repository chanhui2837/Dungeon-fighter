import pygame
from ..game_config import *
from .avatar_draw import draw_character

pygame.font.init()
FONT = pygame.font.Font(None, 32)
SMALL_FONT = pygame.font.Font(None, 24)
TITLE_FONT = pygame.font.Font(None, 48)
ITEM_FONT = pygame.font.Font(None, 20)


class AvatarCustomize:
    def __init__(self, screen, api):
        self.screen = screen
        self.api = api
        self.character = dict(api.user_data.get("character", {})) if api.user_data else {}
        self.current_tab = "hats"
        self.scroll_offset = 0
        self.max_visible = 7
        self.message = ""
        self.message_color = GREEN
        self.preview_hat = self.character.get("hat")
        self.preview_clothes = self.character.get("clothes")
        self.preview_hat_color = self.character.get("hat_color")
        self.preview_clothes_color = self.character.get("clothes_color")

    def draw_text(self, text, font, color, x, y, center=True):
        surf = font.render(text, True, color)
        rect = surf.get_rect()
        if center:
            rect.center = (x, y)
        else:
            rect.topleft = (x, y)
        self.screen.blit(surf, rect)

    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                return "back"
        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if 50 <= mx <= 200 and 700 <= my <= 750:
                return "back"
            if 300 <= mx <= 1000 and 700 <= my <= 750:
                self.save_character()
                return "saved"
            if 320 <= mx <= 520 and 100 <= my <= 145:
                self.current_tab = "hats"
                self.scroll_offset = 0
            elif 540 <= mx <= 740 and 100 <= my <= 145:
                self.current_tab = "clothes"
                self.scroll_offset = 0
            items = AVATAR_ITEMS[self.current_tab]
            list_start_y = 170
            item_h = 65
            for i in range(self.scroll_offset, min(len(items), self.scroll_offset + self.max_visible)):
                iy = list_start_y + (i - self.scroll_offset) * item_h
                if 320 <= mx <= 700 and iy <= my <= iy + item_h:
                    item = items[i]
                    if self.current_tab == "hats":
                        self.preview_hat = item["id"]
                        self.preview_hat_color = item["color"]
                    else:
                        self.preview_clothes = item["id"]
                        self.preview_clothes_color = item["color"]
            if my >= 170 and my <= 170 + self.max_visible * item_h:
                if mx >= 700:
                    self.scroll_offset = min(self.scroll_offset + 1, max(0, len(AVATAR_ITEMS[self.current_tab]) - self.max_visible))
                elif mx <= 320:
                    self.scroll_offset = max(0, self.scroll_offset - 1)
        if event.type == pygame.MOUSEWHEEL:
            items = AVATAR_ITEMS[self.current_tab]
            max_offset = max(0, len(items) - self.max_visible)
            self.scroll_offset = max(0, min(max_offset, self.scroll_offset - event.y))

    def save_character(self):
        char_data = {
            "hat": self.preview_hat,
            "clothes": self.preview_clothes,
            "hat_color": self.preview_hat_color,
            "clothes_color": self.preview_clothes_color
        }
        success = self.api.update_user({"character": char_data})
        if success:
            self.character = char_data
            self.message = "Character saved!"
            self.message_color = GREEN
        else:
            self.message = "Failed to save"
            self.message_color = RED

    def draw(self):
        self.screen.fill(DARK_GRAY)

        self.draw_text("Avatar Customization", TITLE_FONT, GOLD, SCREEN_WIDTH // 2, 45)

        tab_y, tab_h = 100, 45
        hat_sel = self.current_tab == "hats"
        cloth_sel = self.current_tab == "clothes"

        tab1_color = BLUE if hat_sel else DARK_GRAY
        pygame.draw.rect(self.screen, tab1_color, (320, tab_y, 200, tab_h), border_radius=5)
        pygame.draw.rect(self.screen, WHITE, (320, tab_y, 200, tab_h), 2, border_radius=5)
        self.draw_text(f"Hats ({len(AVATAR_ITEMS['hats'])})", FONT, WHITE, 420, tab_y + tab_h // 2)

        tab2_color = BLUE if cloth_sel else DARK_GRAY
        pygame.draw.rect(self.screen, tab2_color, (540, tab_y, 200, tab_h), border_radius=5)
        pygame.draw.rect(self.screen, WHITE, (540, tab_y, 200, tab_h), 2, border_radius=5)
        self.draw_text(f"Clothes ({len(AVATAR_ITEMS['clothes'])})", FONT, WHITE, 640, tab_y + tab_h // 2)

        items = AVATAR_ITEMS[self.current_tab]
        list_start_y = 170
        item_h = 65
        visible_items = items[self.scroll_offset:self.scroll_offset + self.max_visible]

        for i, item in enumerate(visible_items):
            iy = list_start_y + i * item_h
            idx = self.scroll_offset + i
            is_selected = False
            if self.current_tab == "hats":
                is_selected = item["id"] == self.preview_hat
            else:
                is_selected = item["id"] == self.preview_clothes

            bg = (60, 60, 80) if is_selected else (50, 50, 60)
            pygame.draw.rect(self.screen, bg, (320, iy, 380, item_h - 5), border_radius=4)
            if is_selected:
                pygame.draw.rect(self.screen, GOLD, (320, iy, 380, item_h - 5), 2, border_radius=4)

            name = item["name"]
            self.draw_text(name, ITEM_FONT, WHITE, 340, iy + item_h // 2, center=False)

            if item["color"]:
                pygame.draw.rect(self.screen, item["color"],
                               (660, iy + 10, item_h - 20, item_h - 25))
                pygame.draw.rect(self.screen, WHITE,
                               (660, iy + 10, item_h - 20, item_h - 25), 1)

            if idx > 0:
                self.draw_text("<", FONT, GRAY, 310, iy + item_h // 2)
            if idx < len(items) - 1:
                self.draw_text(">", FONT, GRAY, 710, iy + item_h // 2)

        scroll_indicator = f"{self.scroll_offset + 1}-{min(self.scroll_offset + self.max_visible, len(items))}/{len(items)}"
        self.draw_text(scroll_indicator, SMALL_FONT, GRAY, 510, list_start_y + self.max_visible * item_h + 5)

        draw_character(self.screen, 860, 300, scale=2.0,
                      hat_id=self.preview_hat, clothes_id=self.preview_clothes,
                      hat_color=self.preview_hat_color, clothes_color=self.preview_clothes_color)

        hat_name = ""
        clothes_name = ""
        for h in AVATAR_ITEMS["hats"]:
            if h["id"] == self.preview_hat:
                hat_name = h["name"]
        for c in AVATAR_ITEMS["clothes"]:
            if c["id"] == self.preview_clothes:
                clothes_name = c["name"]
        self.draw_text(f"Hat: {hat_name}", SMALL_FONT, LIGHT_GRAY, 860, 480)
        self.draw_text(f"Clothes: {clothes_name}", SMALL_FONT, LIGHT_GRAY, 860, 510)

        if self.api.user_data:
            data = self.api.user_data
            self.draw_text(f"Coins: {data['coins']}", SMALL_FONT, GOLD, 860, 560)
            self.draw_text(f"Level: {data['level']}", SMALL_FONT, CYAN, 860, 590)

        self.draw_text("ESC: Back", SMALL_FONT, GRAY, 125, 680, center=False)

        pygame.draw.rect(self.screen, GRAY, (50, 700, 150, 50), border_radius=5)
        self.draw_text("Back", FONT, WHITE, 125, 725)

        pygame.draw.rect(self.screen, GREEN, (300, 700, 200, 50), border_radius=5)
        self.draw_text("Save", FONT, BLACK, 400, 725)

        if self.message:
            self.draw_text(self.message, SMALL_FONT, self.message_color, SCREEN_WIDTH // 2, 660)
