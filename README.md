# Hamming 🐷

## Problem

Let's say that we want to send a message from a sender to a recipient. Perhaps we're sending a text to a friend, or perhaps we're storing a message for a few years on our hard drive (in which case sender is past you and recipient is future you).

The first thing we do is to convert the message into its binary representation. Then, we send those bits to the recipient. There is just one small problem: how can we be sure that the bits received are the same as the bits sent? There is a small chance of errors when transmitting the data. At any point, a bit might be flipped 0 → 1 or 1 → 0.

Let's consider a simple message, `hello`. First, we'll convert this into its binary representation (as encoded by ASCII):

```txt
hello => 01101000 01100101 01101100 01101100 01101111
```

This message is transmitted. However, a few bits have been flipped in transit. The received message:

```txt
01101010 01100101 01101100 01100100 01101011 => jeldk
```

How can we make our message more resilient to random errors? One naive approach might be to send three copies of the message. That way, if one bit is randomly flipped, we can use the two redundant copies to identify the error, ignore it, and determine the original message:

```txt
01101000 01100101 01101100 01100100 01101111
01101010 01100101 01101100 01101100 01101111
01101000 01100101 01101100 01101100 01101011
-------- -------- -------- -------- --------
01101000 01100101 01101100 01101100 01101111 => hello
```

This approach works, but it is quite wasteful. 67% of our message is being used for redundancy. Is there a better way?

## Solution

One approach uses _Hamming codes_. These were created by the American mathematician Richard W. Hamming in 1950. Let's explore this idea.

### Encoding

The first thing we need to do is to break our message into blocks. The block size should be a power of 2. We'll use `2 ** 4 => 16` for now. 11 of the bits will be used to store our message, and we'll use the other 5 for redundancy.

Our first block of 11 bits will be:

```txt
01101000011
```

Let's format this as a square. A second table with position numbers is included for clarity.

```txt
A B C 0    0 1 2 3
D 1 1 0    4 5 6 7
E 1 0 0    8 9 1011
0 0 1 1    12131415
```

Notice that the five parity bits, `A`, `B`, `C`, `D`, and `E`, are at positions `0`, `1`, `2`, `4`, and `8` respectively. They are all powers of two.

Let's fill in those missing squares. Each square will be filled by counting the number of `1` bits in a subset of positions. If there is an odd number, we will insert an extra `1` to make the overall total even.

First, we'll consider `B`. We'll look at the values in the second and fourth columns:

```txt
X B X 0
X 1 X 0
X 1 X 0
X 0 X 1
```

There are 3 `1`s in this group, so we'll place another `1` at the `B` position to make the total even.

Next, we'll consider `C`. We'll look at the values in the third and fourth columns:

```txt
X X C 0
X X 1 0
X X 0 0
X X 1 1
```

There are 3 `1`s in this group, so we'll place another `1` at the `C` position to make the total even.

Next, we'll consider `D`, We'll look at the values in the second and fourth rows:

```txt
X X X X
D 1 1 0
X X X X
0 0 1 1
```

There are 4 `1`s in this group, so we'll place a `0` at the `D` position to keep the total even.

Next, we'll consider `E`. We'll look at the values in the third and fourth rows:

```txt
X X X X
X X X X
E 1 0 0
0 0 1 1
```

There are 3 `1`s in this group, so we'll place a `1` at the `E` position to make the total even.

Finally, let's consider `A`. We'll look at the entire block, including our calculated values for `B`, `C`, `D`, and `E`:

```txt
A 1 1 0
0 1 1 0
1 1 0 0
0 0 1 1
```

There are 8 `1`s in the entire block, so we'll place a `0` at the `A` position to keep the total even.

Our completed first block:

```txt
0 1 1 0
0 1 1 0
1 1 0 0
0 0 1 1
```

### Decoding

Let's imagine we have received the second block of our message. However, one of the bits has been flipped. How can we find and correct this error?

```txt
0 1 0 0
0 0 1 1
1 1 0 1
1 0 1 1
```

We can check each group, and if the number of `1`s is odd then we know there has been an error:

```txt
0 1 0 0
0 0 1 1
1 1 0 1
1 0 1 1
A => 9 (odd)

X 1 X 0
X 0 X 1
X 1 X 1
X 0 X 1
B => 5 (odd)

X X 0 0
X X 1 1
X X 0 1
X X 1 1
C => 5 (odd)

X X X X
0 0 1 1
X X X X
1 0 1 1
D => 5 (odd)

X X X X
X X X X
1 1 0 1
1 0 1 1
E => 6 (even)
```

From the result of our checking, we can see there is an error in a bit that is included in groups `B`, `C`, and `D`. By the process of elimination, we can determine that the only bit which is included in all three groups, and thus contains the errored bit, is in position `7`. We can unflip this bit, and recover the originally transmitted block:

```txt
0 1 0 0
0 0 1 0
1 1 0 1
1 0 1 1
```

There is a clever shortcut we can take to find the position of the errored bit. Parity bits `B`, `C`, and `D` are in positions `1`, `2`, and `4` respectively. `1 + 2 + 4 => 7`. This will work for any block where there is a single error. Neat!

You may be wondering about the purpose of the `A` bit in position `0`. We can use this bit to check that only one error has occurred. If the parity check for the entire block is even, but the parity checks for one of the subgroups is odd, then more than one error has occurred. Correcting this error is outside the capability of Hamming, but it's important to check nonetheless so we can be sure that only one error has occurred. In our case, the parity check for the entire block is odd, so we can be reasonably confident that only one error has occurred.

Note that we have created a way to encode our message which uses just 5 extra bits per 11 bits of message. This means that only 45% of the space is being used for redundancy.

It is also possible to scale up this technique to larger block sizes. We just need to add extra parity bits at the powers of two, so, for example, a 128-bit block size using this algorithm will allow us to detect and correct single bit errors using only 8 parity bits, just 6% of the message!

Now that you have an understanding of how Hamming codes work, let's get on with the implementation.

## Inspiration

This problem was heavily inspired by [Hamming codes, h■w to ov■rco■e n■ise.](https://youtu.be/X8jsijhllIA) by [3Blue1Brown](https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw).
