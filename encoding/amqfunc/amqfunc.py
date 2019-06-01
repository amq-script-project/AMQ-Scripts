"""
    Various functions for filtering videos specifically for AMQ using Vapoursynth.
    Please make sure you install the required dependancies.
"""

import vapoursynth as vs
import lvsfunc as lvf
import fvsfunc as fvf
from nnedi3_rpow2 import nnedi3_rpow2
import kagefunc as kgf
import vsutil
import vsTAAmbk as taa
core = vs.core

def quick_import(file: str, force_lsmas=False, resample=True):
    """
        A function to quickly import and resample a file.

        If the file does not have a chroma subsampling of 4:2:0, it'll automatically be converted to such.
    """
    src = lvf.src(file, force_lsmas=force_lsmas)
    depth = vsutil.get_depth(src)

    if vsutil.get_subsampling != '420':
        src = multi_resample(src, depth=depth)

    if resample:
        return fvf.Depth(src, 16)
    else:
        return src


def quick_scale(clip: vs.VideoNode, height=480):
    """
        A function for quickly scaling to a specific resolution.
    """
    width = vsutil.get_w(height, aspect_ratio=clip.width / clip.height)

    if height not in [480, 576, 720]:
        raise ValueError('quick_scale: Please use a AMQ-compliant resolution!')

    if height > clip.height:
        return nnedi3_rpow2(clip).resize.Spline36(width, height)
    elif height < clip.height:
        return core.resize.Spline36(clip, width, height)
    else:
        return clip


def quick_output(clip: vs.VideoNode, bitdepth=8):
    """
        A function for quickly preparing the clip for the output node.
    """
    if vsutil.get_depth != bitdepth:
        return fvf.Depth(clip, bitdepth)


def general_filtering(clip: vs.VideoNode, mode='low', denoise=True, deband=True, grain=True):
    """
        Generic filterchain. You can set the overall strenght by changing the mode.

        Modes:
        - lower
        - low
        - medium
        - high
        - higher
    """

    # There's probably way nicer ways to do this
    modes = {
        'lower':  (0.1,  2, 10, 16, 0.1),
        'low':    (0.4,  3, 14, 24, 0.2),
        'medium': (0.6,  4, 16, 32, 0.3),
        'high':   (1.0,  6, 18, 40, 0.8),
        'higher': (2.0, 10, 23, 64, 2.0)
    }
    try:
        h, sigma, range, y, grain_strength = modes[mode]
    except KeyError:
        raise ValueError("general_filtering: Unknown mode!")

    filtered = clip

    if denoise:
        filtered = lvf.quick_denoise(filtered, h=h, sigma=sigma)

    if deband:
        cb = cr = y - 8
        filtered = core.f3kdb.Deband(filtered, range=range, y=y, cb=cb, cr=cr, grainy=0, grainc=0, output_depth=16)

    if grain:
        filtered = kgf.adaptive_grain(filtered, strength=grain_strength)

    return filtered


def general_antialiasing(src, strength='weak'):
    """
        A function for generic antialiasing (AA). Uses either Nnedi3 or Eedi3.

        strength:
        - weak (Nnedi3)
        - strong (Eedi3)
        - stronger (Eedi3SangNom)
    """
    strengths = {
        'weak'     : 'Nnedi3',
        'strong'   : 'Eedi3',
        'stronger' : 'Eedi3SangNom'
    }
    try:
        return taa.TAAmbk(src, aatype=strengths[strength])
    except KeyError:
        raise ValueError("general_antialiasing: Unknown strength!")


# Helper Functions:
def multi_resample(clip, depth=None):
        format = {
            10: vs.YUV420P10,
            12: vs.YUV420P12,
            16: vs.YUV420P16,  # You never know~
        }
        return core.resize.Spline36(clip, format=format.get(depth, vs.YUV420P8))

# PS: I hate everything I've written in here
