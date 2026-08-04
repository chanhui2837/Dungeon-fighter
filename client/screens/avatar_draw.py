import math
import pygame
from ..game_config import *


def draw_character(surface, x, y, scale=1.0, hat_id=None, clothes_id=None, hat_color=None, clothes_color=None):
    s = scale
    cx, cy = x, y

    body_color = SKIN
    if clothes_id == "ninja":
        body_color = DARK_GRAY
    elif clothes_id == "suit" or clothes_id == "tuxedo":
        body_color = WHITE

    neck_y = cy - 30 * s
    head_r = 22 * s
    head_y = neck_y - head_r

    body_top = neck_y
    body_bottom = neck_y + 50 * s
    body_width = 30 * s
    shoulder_y = neck_y + 5 * s

    arm_len = 35 * s
    leg_len = 35 * s

    leg_top = body_bottom

    if clothes_id:
        draw_clothes(surface, cx, body_top, body_bottom, body_width, shoulder_y, arm_len, s, clothes_id, clothes_color)

    pygame.draw.circle(surface, body_color, (int(cx), int(head_y)), int(head_r))
    pygame.draw.circle(surface, BLACK, (int(cx), int(head_y)), int(head_r), 2)

    eye_off = 8 * s
    eye_y = head_y - 2 * s
    pygame.draw.circle(surface, BLACK, (int(cx - eye_off), int(eye_y)), int(3 * s))
    pygame.draw.circle(surface, BLACK, (int(cx + eye_off), int(eye_y)), int(3 * s))

    mouth_y = head_y + 7 * s
    pygame.draw.arc(surface, BLACK, (int(cx - 6 * s), int(mouth_y - 2 * s), int(12 * s), int(8 * s)), 0, math.pi, 2)

    neck_width = 10 * s
    pygame.draw.line(surface, body_color, (cx - neck_width / 2, neck_y), (cx - neck_width / 2, neck_y + 10 * s), int(3 * s))
    pygame.draw.line(surface, body_color, (cx + neck_width / 2, neck_y), (cx + neck_width / 2, neck_y + 10 * s), int(3 * s))

    if not clothes_id or clothes_id in ("tshirt", "hoodie", "sweater"):
        arm_color = body_color if not clothes_id else SKIN
        pygame.draw.line(surface, arm_color, (cx - body_width / 2 - 3 * s, shoulder_y),
                         (cx - body_width / 2 - 3 * s - 10 * s, shoulder_y + arm_len), int(6 * s))
        pygame.draw.line(surface, arm_color, (cx + body_width / 2 + 3 * s, shoulder_y),
                         (cx + body_width / 2 + 3 * s + 10 * s, shoulder_y + arm_len), int(6 * s))

    pygame.draw.line(surface, body_color, (cx - 5 * s, leg_top), (cx - 12 * s, leg_top + leg_len), int(7 * s))
    pygame.draw.line(surface, body_color, (cx + 5 * s, leg_top), (cx + 12 * s, leg_top + leg_len), int(7 * s))

    pygame.draw.circle(surface, BLACK, (int(cx - 12 * s), int(leg_top + leg_len)), int(5 * s))
    pygame.draw.circle(surface, BLACK, (int(cx + 12 * s), int(leg_top + leg_len)), int(5 * s))

    if hat_id:
        draw_hat(surface, cx, head_y, head_r, s, hat_id, hat_color)


def draw_hat(surface, cx, head_y, head_r, s, hat_id, color):
    if hat_id == "baseball_cap":
        brim_points = [(cx - head_r * 1.3, head_y - head_r * 0.3),
                       (cx + head_r * 1.3, head_y - head_r * 0.3)]
        pygame.draw.ellipse(surface, color or RED,
                           (int(cx - head_r * 1.2), int(head_y - head_r * 1.3), int(head_r * 2.4), int(head_r * 0.9)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - head_r * 1.2), int(head_y - head_r * 1.3), int(head_r * 2.4), int(head_r * 0.9)), 2)
        pygame.draw.ellipse(surface, color or RED,
                           (int(cx - head_r * 1.4), int(head_y - head_r * 0.2), int(head_r * 2.8), int(head_r * 0.3)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - head_r * 1.4), int(head_y - head_r * 0.2), int(head_r * 2.8), int(head_r * 0.3)), 2)

    elif hat_id == "beanie":
        pygame.draw.ellipse(surface, color or BLUE,
                           (int(cx - head_r * 1.2), int(head_y - head_r * 1.8), int(head_r * 2.4), int(head_r * 1.6)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - head_r * 1.2), int(head_y - head_r * 1.8), int(head_r * 2.4), int(head_r * 1.6)), 2)
        pygame.draw.circle(surface, color or BLUE, (int(cx), int(head_y - head_r * 2.1)), int(5 * s))

    elif hat_id == "crown" or hat_id == "crown_gold":
        c = color or GOLD
        h = head_r * 1.6
        points = [(cx - head_r * 1.1, head_y - head_r * 0.2),
                  (cx - head_r * 1.1, head_y - h),
                  (cx - head_r * 0.6, head_y - h + 6 * s),
                  (cx, head_y - h),
                  (cx + head_r * 0.6, head_y - h + 6 * s),
                  (cx + head_r * 1.1, head_y - h),
                  (cx + head_r * 1.1, head_y - head_r * 0.2)]
        pygame.draw.polygon(surface, c, points)
        pygame.draw.polygon(surface, BLACK, points, 2)
        for i in (-0.6, 0, 0.6):
            pygame.draw.circle(surface, RED, (int(cx + i * head_r), int(head_y - h + 3 * s)), int(3 * s))

    elif hat_id == "top_hat":
        w = head_r * 1.6
        h = head_r * 2
        pygame.draw.rect(surface, color or BLACK,
                        (int(cx - w / 2), int(head_y - h - 5 * s), int(w), int(h)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - w / 2), int(head_y - h - 5 * s), int(w), int(h)), 2)
        pygame.draw.rect(surface, color or BLACK,
                        (int(cx - w / 2 - 10 * s), int(head_y - 8 * s), int(w + 20 * s), int(12 * s)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - w / 2 - 10 * s), int(head_y - 8 * s), int(w + 20 * s), int(12 * s)), 2)

    elif hat_id == "cowboy":
        w = head_r * 3
        h = head_r * 1.2
        points = [(cx - w / 2, head_y - 5 * s),
                  (cx - w / 3, head_y - h - 10 * s),
                  (cx, head_y - h - 15 * s),
                  (cx + w / 3, head_y - h - 10 * s),
                  (cx + w / 2, head_y - 5 * s)]
        pygame.draw.polygon(surface, color or BROWN, points)
        pygame.draw.polygon(surface, BLACK, points, 2)
        pygame.draw.ellipse(surface, color or BROWN,
                           (int(cx - w / 2), int(head_y - 8 * s), int(w), int(14 * s)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - w / 2), int(head_y - 8 * s), int(w), int(14 * s)), 2)

    elif hat_id == "wizard":
        h = head_r * 2.5
        points = [(cx - head_r * 0.3, head_y - 5 * s),
                  (cx - head_r * 1.4, head_y - h),
                  (cx + head_r * 0.3, head_y - 5 * s)]
        pygame.draw.polygon(surface, color or PURPLE, points)
        pygame.draw.polygon(surface, BLACK, points, 2)
        pygame.draw.circle(surface, GOLD, (int(cx - head_r * 0.8), int(head_y - h + 10 * s)), int(5 * s))

    elif hat_id == "santa":
        h = head_r * 1.5
        points = [(cx - head_r * 1.2, head_y - 5 * s),
                  (cx - head_r * 1.2, head_y - h),
                  (cx + head_r * 1.2, head_y - h),
                  (cx + head_r * 1.2, head_y - 5 * s)]
        pygame.draw.polygon(surface, color or RED, points)
        pygame.draw.polygon(surface, BLACK, points, 2)
        pygame.draw.circle(surface, WHITE, (int(cx), int(head_y - h)), int(6 * s))
        pygame.draw.rect(surface, WHITE, (int(cx - head_r * 1.2), int(head_y - 8 * s), int(head_r * 2.4), int(10 * s)))

    elif hat_id == "fedora":
        w = head_r * 2.6
        pygame.draw.ellipse(surface, color or DARK_GRAY,
                           (int(cx - w / 2), int(head_y - head_r * 1.6), int(w), int(head_r * 1.6)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - w / 2), int(head_y - head_r * 1.6), int(w), int(head_r * 1.6)), 2)
        pygame.draw.ellipse(surface, color or DARK_GRAY,
                           (int(cx - w / 2 - 5 * s), int(head_y - 6 * s), int(w + 10 * s), int(12 * s)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - w / 2 - 5 * s), int(head_y - 6 * s), int(w + 10 * s), int(12 * s)), 2)
        pygame.draw.rect(surface, BLACK, (int(cx - 2 * s), int(head_y - head_r * 1.4), int(4 * s), int(head_r * 0.8)))

    elif hat_id == "headband":
        pygame.draw.rect(surface, color or RED,
                        (int(cx - head_r * 1.2), int(head_y - head_r * 0.7), int(head_r * 2.4), int(8 * s)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - head_r * 1.2), int(head_y - head_r * 0.7), int(head_r * 2.4), int(8 * s)), 2)
        pygame.draw.line(surface, color or RED, (cx + head_r * 1.0, head_y - head_r * 0.5),
                         (cx + head_r * 1.5, head_y - head_r * 0.2), int(4 * s))

    elif hat_id == "helmet":
        pygame.draw.ellipse(surface, color or GRAY,
                           (int(cx - head_r * 1.3), int(head_y - head_r * 1.8), int(head_r * 2.6), int(head_r * 1.8)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - head_r * 1.3), int(head_y - head_r * 1.8), int(head_r * 2.6), int(head_r * 1.8)), 2)
        pygame.draw.rect(surface, DARK_GRAY,
                        (int(cx - head_r * 0.1), int(head_y + head_r * 0.1), int(head_r * 0.2), int(head_r * 0.8)))

    elif hat_id == "beret":
        pygame.draw.ellipse(surface, color or GREEN,
                           (int(cx - head_r * 1.4), int(head_y - head_r * 1.6), int(head_r * 2.8), int(head_r * 1.3)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - head_r * 1.4), int(head_y - head_r * 1.6), int(head_r * 2.8), int(head_r * 1.3)), 2)

    elif hat_id == "cap_visor":
        pygame.draw.ellipse(surface, color or ORANGE,
                           (int(cx - head_r * 1.1), int(head_y - head_r * 1.3), int(head_r * 2.2), int(head_r * 0.8)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - head_r * 1.1), int(head_y - head_r * 1.3), int(head_r * 2.2), int(head_r * 0.8)), 2)
        pygame.draw.ellipse(surface, color or ORANGE,
                           (int(cx - head_r * 1.3), int(head_y - head_r * 0.2), int(head_r * 2.6), int(head_r * 0.3)))
        pygame.draw.ellipse(surface, BLACK,
                           (int(cx - head_r * 1.3), int(head_y - head_r * 0.2), int(head_r * 2.6), int(head_r * 0.3)), 2)

    elif hat_id == "party_hat":
        h = head_r * 1.8
        points = [(cx - head_r * 1.1, head_y - 5 * s),
                  (cx, head_y - h),
                  (cx + head_r * 1.1, head_y - 5 * s)]
        pygame.draw.polygon(surface, color or PINK, points)
        pygame.draw.polygon(surface, BLACK, points, 2)
        for i in range(3):
            c = [RED, BLUE, YELLOW][i]
            yy = head_y - h + 8 * s + i * 10 * s
            pygame.draw.circle(surface, c, (int(cx), int(yy)), int(3 * s))


def draw_clothes(surface, cx, body_top, body_bottom, body_width, shoulder_y, arm_len, s, clothes_id, color):
    if clothes_id == "tshirt":
        c = color or WHITE
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 2 * s), int(body_top), int(body_width + 4 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 2 * s), int(body_top), int(body_width + 4 * s), int(body_bottom - body_top)), 2)
        arm_w = 7 * s
        pygame.draw.line(surface, c, (cx - body_width / 2 - 2 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(arm_w))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 2 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(arm_w))
        neck = 10 * s
        pygame.draw.rect(surface, SKIN,
                        (int(cx - neck / 2), int(body_top), int(neck), int(8 * s)))

    elif clothes_id == "suit":
        c = color or NAVY
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)), 2)
        cx2 = int(cx)
        pygame.draw.line(surface, BLACK, (cx2, body_top + 5 * s), (cx2, body_bottom - 5 * s), 2)
        pygame.draw.rect(surface, WHITE,
                        (int(cx - 5 * s), int(body_top), int(10 * s), int(15 * s)))
        pygame.draw.line(surface, c, (cx - body_width / 2 - 3 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(7 * s))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 3 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(7 * s))

    elif clothes_id == "armor":
        c = color or GRAY
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 4 * s), int(body_top), int(body_width + 8 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 4 * s), int(body_top), int(body_width + 8 * s), int(body_bottom - body_top)), 2)
        for i in range(4):
            yy = int(body_top + 8 * s + i * 9 * s)
            pygame.draw.rect(surface, DARK_GRAY,
                            (int(cx - body_width / 2 + 2 * s), yy, int(body_width - 4 * s), int(4 * s)))
        pygame.draw.line(surface, c, (cx - body_width / 2 - 4 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(8 * s))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 4 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(8 * s))

    elif clothes_id == "hoodie":
        c = color or DARK_GREEN
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)), 2)
        pocket = pygame.Rect(int(cx - body_width / 3), int(body_top + body_width * 0.8), int(body_width * 0.66), int(12 * s))
        pygame.draw.rect(surface, BLACK, pocket, 2)
        hood = pygame.Rect(int(cx - body_width / 2 - 2 * s), int(body_top - 10 * s), int(body_width + 4 * s), int(15 * s))
        pygame.draw.ellipse(surface, c, hood)
        pygame.draw.ellipse(surface, BLACK, hood, 2)
        arm_w = 7 * s
        pygame.draw.line(surface, c, (cx - body_width / 2 - 2 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(arm_w))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 2 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(arm_w))

    elif clothes_id == "jacket":
        c = color or BROWN
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)), 2)
        pygame.draw.line(surface, BLACK, (cx, body_top + 5 * s), (cx, body_bottom - 5 * s), 2)
        for i in range(3):
            yy = int(body_top + 12 * s + i * 10 * s)
            pygame.draw.circle(surface, BLACK, (int(cx), yy), 2)
        pygame.draw.line(surface, c, (cx - body_width / 2 - 3 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(7 * s))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 3 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(7 * s))

    elif clothes_id == "vest":
        c = color or ORANGE
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 2 * s), int(body_top), int(body_width * 0.45 + 2 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, c,
                        (int(cx + 2 * s), int(body_top), int(body_width * 0.45 + 2 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 2 * s), int(body_top), int(body_width * 0.45 + 2 * s), int(body_bottom - body_top)), 2)
        pygame.draw.rect(surface, BLACK,
                        (int(cx + 2 * s), int(body_top), int(body_width * 0.45 + 2 * s), int(body_bottom - body_top)), 2)

    elif clothes_id == "robe":
        c = color or PURPLE
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 5 * s), int(body_top), int(body_width + 10 * s), int(body_bottom - body_top + 20 * s)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 5 * s), int(body_top), int(body_width + 10 * s), int(body_bottom - body_top + 20 * s)), 2)
        pygame.draw.line(surface, GOLD, (cx, body_top + 5 * s), (cx, body_top + 20 * s), 3)

    elif clothes_id == "punk_vest":
        c = color or BLACK
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 2 * s), int(body_top), int(body_width * 0.5), int(body_bottom - body_top)))
        pygame.draw.rect(surface, c,
                        (int(cx + 2 * s), int(body_top), int(body_width * 0.5), int(body_bottom - body_top)))
        pygame.draw.rect(surface, RED,
                        (int(cx - body_width / 2 - 2 * s), int(body_top), int(body_width * 0.5), int(body_bottom - body_top)), 2)
        pygame.draw.rect(surface, RED,
                        (int(cx + 2 * s), int(body_top), int(body_width * 0.5), int(body_bottom - body_top)), 2)
        for i in range(3):
            spike_y = int(body_top + 8 * s + i * 12 * s)
            pygame.draw.polygon(surface, GRAY,
                               [(int(cx - body_width * 0.3), spike_y),
                                (int(cx - body_width * 0.25), spike_y - 6 * s),
                                (int(cx - body_width * 0.2), spike_y)])

    elif clothes_id == "ninja":
        c = color or DARK_GRAY
        hr = 22 * s
        hy = body_top - 30 * s
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 3 * s), int(body_top - 5 * s), int(body_width + 6 * s), int(body_bottom - body_top + 10 * s)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 3 * s), int(body_top - 5 * s), int(body_width + 6 * s), int(body_bottom - body_top + 10 * s)), 2)
        mask = pygame.Rect(int(cx - hr - 2 * s), int(hy - hr - 2 * s),
                          int(2 * hr + 4 * s), int(hr + 5 * s))
        pygame.draw.ellipse(surface, c, mask)
        pygame.draw.ellipse(surface, BLACK, mask, 2)
        eye_r = int(4 * s)
        pygame.draw.circle(surface, WHITE, (int(cx - 8 * s), int(hy - 2 * s)), eye_r)
        pygame.draw.circle(surface, WHITE, (int(cx + 8 * s), int(hy - 2 * s)), eye_r)
        pygame.draw.circle(surface, BLACK, (int(cx - 8 * s), int(hy - 2 * s)), int(2 * s))
        pygame.draw.circle(surface, BLACK, (int(cx + 8 * s), int(hy - 2 * s)), int(2 * s))
        pygame.draw.line(surface, c, (cx - body_width / 2 - 3 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(7 * s))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 3 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(7 * s))

    elif clothes_id == "captain":
        c = color or MAROON
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 4 * s), int(body_top), int(body_width + 8 * s), int(body_bottom - body_top + 10 * s)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 4 * s), int(body_top), int(body_width + 8 * s), int(body_bottom - body_top + 10 * s)), 2)
        for i in range(2):
            yy = int(body_top + 15 * s + i * 18 * s)
            pygame.draw.circle(surface, GOLD, (int(cx), yy), int(4 * s))
        epaulet_w = 10 * s
        pygame.draw.ellipse(surface, GOLD,
                           (int(cx - body_width / 2 - epaulet_w), int(shoulder_y - 3 * s), int(epaulet_w + 5 * s), int(10 * s)))
        pygame.draw.ellipse(surface, GOLD,
                           (int(cx + body_width / 2 - 5 * s), int(shoulder_y - 3 * s), int(epaulet_w + 5 * s), int(10 * s)))
        pygame.draw.line(surface, c, (cx - body_width / 2 - 4 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(7 * s))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 4 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(7 * s))

    elif clothes_id == "sweater":
        c = color or CYAN
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, BLACK,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)), 2)
        pattern_color = WHITE if c == CYAN else BLACK
        for i in range(5):
            yy = int(body_top + 6 * s + i * 8 * s)
            pygame.draw.line(surface, pattern_color, (cx - body_width / 3, yy), (cx + body_width / 3, yy), 1)
        turtle = pygame.Rect(int(cx - 6 * s), int(body_top - 8 * s), int(12 * s), int(12 * s))
        pygame.draw.ellipse(surface, c, turtle)
        pygame.draw.ellipse(surface, BLACK, turtle, 2)
        arm_w = 7 * s
        pygame.draw.line(surface, c, (cx - body_width / 2 - 2 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(arm_w))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 2 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(arm_w))

    elif clothes_id == "tuxedo":
        c = color or BLACK
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 3 * s), int(body_top), int(body_width + 6 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, WHITE,
                        (int(cx - body_width / 2 - 2 * s), int(body_top), int(body_width * 0.5 + 2 * s), int(body_bottom - body_top)), 2)
        pygame.draw.rect(surface, WHITE,
                        (int(cx + 2 * s), int(body_top), int(body_width * 0.5 + 2 * s), int(body_bottom - body_top)), 2)
        bow = pygame.Rect(int(cx - 8 * s), int(body_top + 5 * s), int(16 * s), int(8 * s))
        pygame.draw.ellipse(surface, WHITE, bow)
        pygame.draw.ellipse(surface, BLACK, bow, 1)
        pygame.draw.line(surface, c, (cx - body_width / 2 - 3 * s, shoulder_y),
                         (cx - body_width / 2 - 12 * s, shoulder_y + arm_len), int(7 * s))
        pygame.draw.line(surface, c, (cx + body_width / 2 + 3 * s, shoulder_y),
                         (cx + body_width / 2 + 12 * s, shoulder_y + arm_len), int(7 * s))

    elif clothes_id == "battle_armor":
        c = color or DARK_GRAY
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 4 * s), int(body_top), int(body_width + 8 * s), int(body_bottom - body_top)))
        pygame.draw.rect(surface, RED,
                        (int(cx - body_width / 2 - 4 * s), int(body_top), int(body_width + 8 * s), int(body_bottom - body_top)), 2)
        for i in range(3):
            yy = int(body_top + 12 * s + i * 12 * s)
            pygame.draw.rect(surface, RED,
                            (int(cx - 8 * s), yy, int(16 * s), int(5 * s)))
        shoulder_w = 12 * s
        pygame.draw.circle(surface, c, (int(cx - body_width / 2 - shoulder_w), int(shoulder_y)), int(shoulder_w))
        pygame.draw.circle(surface, RED, (int(cx - body_width / 2 - shoulder_w), int(shoulder_y)), int(shoulder_w), 2)
        pygame.draw.circle(surface, c, (int(cx + body_width / 2 + shoulder_w), int(shoulder_y)), int(shoulder_w))
        pygame.draw.circle(surface, RED, (int(cx + body_width / 2 + shoulder_w), int(shoulder_y)), int(shoulder_w), 2)

    elif clothes_id == "royal":
        c = color or TEAL
        pygame.draw.rect(surface, c,
                        (int(cx - body_width / 2 - 5 * s), int(body_top), int(body_width + 10 * s), int(body_bottom - body_top + 15 * s)))
        pygame.draw.rect(surface, GOLD,
                        (int(cx - body_width / 2 - 5 * s), int(body_top), int(body_width + 10 * s), int(body_bottom - body_top + 15 * s)), 2)
        cape_w = body_width * 0.7
        cape_points = [(int(cx - cape_w), int(body_top)),
                      (int(cx - cape_w - 15 * s), int(body_bottom + 20 * s)),
                      (int(cx), int(body_bottom + 30 * s)),
                      (int(cx + cape_w + 15 * s), int(body_bottom + 20 * s)),
                      (int(cx + cape_w), int(body_top))]
        pygame.draw.polygon(surface, GOLD, cape_points, 2)
        pygame.draw.line(surface, GOLD, (cx, body_top + 5 * s), (cx, body_top + 25 * s), 3)
