type: modal
### Field Template

The **Field Template** lets you predefine a pattern for your Game of Life grid.  
It uses a special compact format to encode the initial state.

---

#### Format

The template string looks like this:

```
v{version}w{width};{data}
```

- **v**: version of the format (1, 2 or 3)
- **w**: intended width of the field
- **data**: encoded field content

The width is important for correct visual alignment.  
If the actual game width is smaller than the one in the template, some cells may be **cut off**.

---

#### Version Types

##### **v1** — Raw binary (editable)
- Encodes every cell with `1` (alive) or `0` (dead)
- Example:
```
v1w10;000000000011100000001110
```
- Easy to edit manually  
- Not space-efficient for large fields

---

##### **v2** — Run-length encoding (RLE)
- Compresses alternating runs of `0`s and `1`s
- Syntax: `{symbol}[{count}]`
- First symbol (e.g. `0`) defines the start, and following `[count]`s alternate between `0` and `1`

- Example:
```
v2w100;0[607]3111[10]911121847[23][70]8[9242]
```
This means:
- Start with `0`, repeat it 607 times  
- Then `1` three times  
- Then `0` once  
- Then `1` once, etc.

---

##### **v3** — Compressed RLE with base-62
- Same idea as `v2`, but counts are encoded in **base-62**
- Character set:
```
0–9 → 0–9
10–35 → a–z
36–61 → A–Z
```
- This reduces size drastically for very large grids

- Example:
```
v3w100;0[bN]3kZ
```

---

#### Notes

- `v3` is best for large exported fields and copying between sessions.  
- You can use **Copy Field Template** buttons to export in any version.  
- You can also use the **Copy URL** button to generate a shareable link that preserves the **rule**, **field template**, **width**, and **height** — all in one click.

---

### Tip

A preview of the parsed field is shown below the template input.  
Adjust your width and version accordingly to ensure proper alignment.
