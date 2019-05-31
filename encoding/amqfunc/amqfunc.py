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

    if vsutil.get_subsampling is not '420':
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
    if mode is 'lower':
        h = 0.1
        sigma = 2
        range = 10
        y = 16
        grain_strength = 0.1
    elif mode is 'low':
        h = 0.4
        sigma = 3
        range = 14
        y = 24
        grain_strength = 0.2
    elif mode is 'medium':
        h = 0.6
        sigma = 4
        range = 16
        y = 32
        grain_strength = 0.3
    elif mode is 'high':
        h = 1
        sigma = 6
        range = 18
        y = 40
        grain_strength = 0.8
    elif mode is 'higher':
        h = 2
        sigma = 10
        range = 23
        y = 64
        grain_strength = 2
    else:
        raise ValueError("general_filtering: Unknown mode!")

    cb = y - 8
    cr = y - 8
    filtered = clip

    if denoise:
        filtered = lvf.quick_denoise(filtered, h=h, sigma=sigma)

    if deband:
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
    if strength is 'weak':
        aatype = 'Nnedi3'
    elif strength is 'strong':
        aatype = 'Eedi3'
    elif strength is 'stronger':
        aatype = 'Eedi3SangNom'
    else:
        raise ValueError("general_antialiasing: Unknown strength!")

    return taa.TAAmbk(src, aatype=aatype)


# Helper Functions:
def multi_resample(clip, depth=None):
        if depth == 10:
            return core.resize.Spline36(clip, format=vs.YUV420P10)
        elif depth == 12:
            return core.resize.Spline36(clip, format=vs.YUV420P12)
        elif depth == 16: # You never know~
            return core.resize.Spline36(clip, format=vs.YUV420P16)
        else:
            return core.resize.Spline36(clip, format=vs.YUV420P8)

# PS: I hate everything I've written in here
