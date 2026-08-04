import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pygame
from client.game_config import *
from client.network.api import GameAPI
from client.screens.login_screen import LoginScreen
from client.screens.main_menu import MainMenu
from client.screens.settings import SettingsScreen
from client.screens.avatar_customize import AvatarCustomize
from client.screens.game_mode import GameModeScreen


class GameClient:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption("Dungeon Fighter")
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        self.clock = pygame.time.Clock()
        self.api = GameAPI()
        self.running = True
        self.current_screen = "login"
        self.prev_screen = None

        self.login_screen = LoginScreen(self.screen, self.api)
        self.main_menu = MainMenu(self.screen, self.api)
        self.settings = SettingsScreen(self.screen, self.api)
        self.avatar = None
        self.game_mode = None

    def run(self):
        while self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                else:
                    self.handle_event(event)

            self.draw()
            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

    def handle_event(self, event):
        if self.current_screen == "login":
            self.login_screen.handle_event(event)
            if self.api.is_logged_in():
                self.current_screen = "main"
                self.main_menu = MainMenu(self.screen, self.api)
                self.settings = SettingsScreen(self.screen, self.api)
                self.avatar = None
                self.game_mode = None

        elif self.current_screen == "main":
            result = self.main_menu.handle_event(event)
            if result == "game_mode":
                self.current_screen = "game_mode"
                self.game_mode = GameModeScreen(self.screen, self.api)
            elif result == "avatar":
                self.current_screen = "avatar"
                self.avatar = AvatarCustomize(self.screen, self.api)
            elif result == "settings":
                self.current_screen = "settings"
                self.settings = SettingsScreen(self.screen, self.api)
            elif result == "logout":
                self.api.logout()
                self.current_screen = "login"
                self.login_screen = LoginScreen(self.screen, self.api)

        elif self.current_screen == "settings":
            result = self.settings.handle_event(event)
            if result == "back":
                self.current_screen = "main"
            elif result == "logout":
                self.current_screen = "login"
                self.login_screen = LoginScreen(self.screen, self.api)
            elif result == "deleted":
                self.current_screen = "login"
                self.login_screen = LoginScreen(self.screen, self.api)

        elif self.current_screen == "avatar":
            result = self.avatar.handle_event(event)
            if result == "back" or result == "saved":
                self.api.get_user()
                self.current_screen = "main"

        elif self.current_screen == "game_mode":
            result = self.game_mode.handle_event(event)
            if result == "back":
                self.current_screen = "main"
            elif result == "single":
                print("Single Play selected - coming soon!")
            elif result == "multi":
                print("Multi Play selected - coming soon!")

    def draw(self):
        if self.current_screen == "login":
            self.login_screen.draw()
        elif self.current_screen == "main":
            self.main_menu.draw()
        elif self.current_screen == "settings":
            self.settings.draw()
        elif self.current_screen == "avatar":
            self.avatar.draw()
        elif self.current_screen == "game_mode":
            self.game_mode.draw()


if __name__ == "__main__":
    game = GameClient()
    game.run()
